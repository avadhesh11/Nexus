from app.rag.chunker import chunk_text


def test_chunk_text_empty_and_whitespace():
    """Empty or whitespace-only text returns empty list."""
    assert chunk_text("") == []
    assert chunk_text("   \n\t  ") == []
    assert chunk_text(None) == []


def test_chunk_text_within_chunk_size():
    """Text with word count less than or equal to chunk_size returns single element."""
    text = "Nexus is an AI collaborative platform for agile engineering teams."
    chunks = chunk_text(text, chunk_size=100)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_splits_with_overlap():
    """Text with word count exceeding chunk_size splits into overlapping chunks."""
    # 20 words total
    words = [f"word{i}" for i in range(20)]
    text = " ".join(words)

    # chunk_size = 10, overlap = 3
    # Chunk 1: words 0..9 (10 words)
    # Chunk 2: start = 10 - 3 = 7 -> words 7..16 (10 words)
    # Chunk 3: start = 7 + 10 - 3 = 14 -> words 14..19 (6 words)
    chunks = chunk_text(text, chunk_size=10, overlap=3)
    assert len(chunks) == 3

    chunk1_words = chunks[0].split()
    chunk2_words = chunks[1].split()
    assert len(chunk1_words) == 10
    assert len(chunk2_words) == 10

    # Overlap verification: last 3 words of chunk 1 should match first 3 words of chunk 2
    assert chunk1_words[-3:] == chunk2_words[:3]
    assert chunk2_words[:3] == ["word7", "word8", "word9"]


def test_chunk_text_zero_overlap():
    """Chunks with zero overlap partition the word stream without duplication."""
    words = [f"token_{i}" for i in range(15)]
    text = " ".join(words)

    chunks = chunk_text(text, chunk_size=5, overlap=0)
    assert len(chunks) == 3
    assert chunks[0] == " ".join(words[0:5])
    assert chunks[1] == " ".join(words[5:10])
    assert chunks[2] == " ".join(words[10:15])

