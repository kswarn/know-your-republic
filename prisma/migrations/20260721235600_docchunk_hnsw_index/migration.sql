-- Prisma cannot express a pgvector index in schema.prisma, so it's added by hand here.
-- HNSW over cosine distance is the retrieval helpers' expected index type (src/lib/rag/,
-- Phase 4) — built now so DocChunk never runs an unindexed sequential scan once populated.
CREATE INDEX IF NOT EXISTS "DocChunk_embedding_hnsw_idx"
  ON "DocChunk"
  USING hnsw ("embedding" vector_cosine_ops);
