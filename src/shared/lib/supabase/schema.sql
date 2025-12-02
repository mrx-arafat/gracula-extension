-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(), -- Optional: link to Supabase Auth user
  platform text not null,
  contact_name text not null,
  contact_id text, -- Platform specific ID if available
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Create a table to store message embeddings
create table if not exists message_embeddings (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid default auth.uid(),
  content text not null,
  speaker text not null, -- 'Me' or 'Friend' (or specific name)
  embedding vector(1536), -- OpenAI embedding dimension
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Create a table for conversation summaries (for efficient retrieval)
create table if not exists conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  summary text not null,
  embedding vector(1536),
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for faster queries
create index if not exists message_embeddings_conversation_id_idx on message_embeddings(conversation_id);
create index if not exists message_embeddings_user_id_idx on message_embeddings(user_id);

-- Create IVFFlat index for fast similarity search (approximate nearest neighbor)
-- Note: This requires a sufficient number of rows to be effective. 
-- For smaller datasets, exact search (without index) is fast enough.
-- create index on message_embeddings using ivfflat (embedding vector_cosine_ops)
-- with (lists = 100);

-- Enable Row Level Security (RLS)
alter table conversations enable row level security;
alter table message_embeddings enable row level security;
alter table conversation_summaries enable row level security;

-- Create policies
-- 1. Users can only see their own data
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Message Embeddings policies
create policy "Users can view their own message embeddings"
  on message_embeddings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own message embeddings"
  on message_embeddings for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own message embeddings"
  on message_embeddings for delete
  using (auth.uid() = user_id);

-- Conversation Summaries policies
create policy "Users can view their own summaries"
  on conversation_summaries for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = conversation_summaries.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert their own summaries"
  on conversation_summaries for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = conversation_summaries.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Function to match documents (semantic search)
create or replace function match_messages (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid default auth.uid(),
  filter_conversation_id uuid default null
)
returns table (
  id uuid,
  content text,
  speaker text,
  similarity float,
  message_timestamp timestamp with time zone,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    message_embeddings.id,
    message_embeddings.content,
    message_embeddings.speaker,
    1 - (message_embeddings.embedding <=> query_embedding) as similarity,
    message_embeddings.timestamp as message_timestamp,
    message_embeddings.metadata
  from message_embeddings
  where 1 - (message_embeddings.embedding <=> query_embedding) > match_threshold
  and message_embeddings.user_id = filter_user_id
  and (filter_conversation_id is null or message_embeddings.conversation_id = filter_conversation_id)
  order by message_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;