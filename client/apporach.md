# Approach Note - Chat-Based Layout Agent

## 🎯 Overall Approach

నేను **hybrid system** ని build చేశాను - common commands కి rule-based transformations, complex commands కి LLM-based reasoning.

## 🧠 System Prompt Design

System prompt లో మూడు key things focus చేశాను:
1. **Normalized coordinates (nx, ny, nw, nh)** - aspect ratio changes కి ఇది key
2. **Semantic understanding** - "Product.png", "Luxury Comfort" వంటి content నుండి elements identify చేయడం
3. **Strict JSON output** - LLM నుండి valid JSON మాత్రమే వచ్చేలా enforced

## 🔧 JSON Transformation Strategy

**Safety First approach:**
- Deep cloning before any mutation
- Validation after every transformation
- Fallback to original layout on error

**Key transformation functions:**
- `resizeArtboard()` - Uses normalized values for perfect scaling
- `moveNode()` - Updates both absolute and normalized coordinates
- `findNodeByRole()` - Semantic search for elements by role
- `resizeText()` - Scales font sizes proportionally

## 💬 Conversation Context Management

Last 6 messages ని history గా pass చేస్తాను, ఇది:
- Referential understanding ("make it smaller")
- Sequential operations 
- Natural follow-ups

## ⚖️ Trade-offs

**What I chose:**
- Rule-based handlers for common commands (faster, more reliable)
- Groq's Llama model (free tier, good performance)
- Simple wireframe preview instead of canvas (time constraint)

**Future improvements:**
- Undo/redo functionality
- Group selection support
- Actual image rendering in preview
- More sophisticated prompt tuning

## 🧪 Testing Commands Tested:

✅ "Convert this to 9:16" - Canvas 1080×1920
✅ "Make the headline smaller" - Font size reduced 20%
✅ "Move offer badge higher" - Position shifted up
✅ "Change headline color to red" - Text color changed
✅ "Center the product" - Product image centered