import express from 'express';
import { getLayoutUpdate } from '../services/llmService.js';
import { resizeArtboard, moveNode, findNodeByRole, resizeText } from '../services/layoutTransforms.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, layout, history } = req.body;
  
  console.log('📨 Received message:', message);
  
  try {
    let updatedLayout = JSON.parse(JSON.stringify(layout));
    let explanation = '';
    let usedLLM = false;
    
    const msgLower = message.toLowerCase().trim();
    
    // ============================================
    // GREETINGS HANDLER
    // ============================================
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'hola'];
    if (greetings.includes(msgLower)) {
      console.log('🎉 Greeting detected!');
      explanation = "Hello! 👋 I'm ready to help. What would you like to do with this layout?";
      return res.json({ updatedLayout, explanation, success: true });
    }
    
    // ============================================
    // COMMAND 1: Convert to 9:16 (FLEXIBLE)
    // ============================================
    if (msgLower.includes('9:16') || 
        msgLower.includes('convert to 9:16') || 
        msgLower.includes('converting to 9:16') ||
        (msgLower.includes('convert') && msgLower.includes('story'))) {
      console.log('🔄 Converting to 9:16');
      updatedLayout = resizeArtboard(updatedLayout, 1080, 1920);
      explanation = "✅ Converted to 9:16 aspect ratio (1080×1920)";
    }
    
    // ============================================
    // COMMAND 2: Convert to 16:9
    // ============================================
    else if (msgLower.includes('16:9') || 
             msgLower.includes('convert to 16:9') ||
             msgLower.includes('youtube')) {
      console.log('🔄 Converting to 16:9');
      updatedLayout = resizeArtboard(updatedLayout, 1920, 1080);
      explanation = "✅ Converted to 16:9 aspect ratio (1920×1080)";
    }
    
    // ============================================
    // COMMAND 3: Make headline smaller
    // ============================================
    else if (msgLower.includes('headline') && msgLower.includes('smaller')) {
      console.log('📝 Making headline smaller');
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = resizeText(updatedLayout, result.id, 0.8);
        explanation = "✅ Made the headline smaller (font size reduced by 20%)";
      } else {
        explanation = "❌ Could not find the headline element";
      }
    }
    
    // ============================================
    // COMMAND 4: Make headline bigger
    // ============================================
    else if (msgLower.includes('headline') && (msgLower.includes('bigger') || msgLower.includes('larger'))) {
      console.log('📝 Making headline bigger');
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = resizeText(updatedLayout, result.id, 1.2);
        explanation = "✅ Made the headline bigger (font size increased by 20%)";
      } else {
        explanation = "❌ Could not find the headline element";
      }
    }
    
    // ============================================
    // COMMAND 5: Move headline to top
    // ============================================
    else if (msgLower.includes('move headline') && msgLower.includes('top')) {
      console.log('⬆️ Moving headline to top');
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'top');
        explanation = "✅ Moved the headline to the top";
      } else {
        explanation = "❌ Could not find the headline element";
      }
    }
    
    // ============================================
    // COMMAND 6: Move offer badge higher
    // ============================================
    else if ((msgLower.includes('offer') || msgLower.includes('badge')) && 
             (msgLower.includes('higher') || msgLower.includes('up'))) {
      console.log('⬆️ Moving offer badge higher');
      const result = findNodeByRole(updatedLayout, 'offer');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'higher');
        explanation = "✅ Moved the offer badge higher";
      } else {
        explanation = "❌ Could not find the offer badge";
      }
    }
    
    // ============================================
    // COMMAND 7: Center product
    // ============================================
    else if (msgLower.includes('center') && msgLower.includes('product')) {
      console.log('🎯 Centering product');
      const result = findNodeByRole(updatedLayout, 'product');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'center');
        explanation = "✅ Centered the product image";
      } else {
        explanation = "❌ Could not find the product image";
      }
    }
    
    // ============================================
    // COMMAND 8: Change headline color
    // ============================================
    else if (msgLower.includes('headline') && msgLower.includes('color')) {
      console.log('🎨 Changing headline color');
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        let color = '#FF0000';
        let colorName = 'red';
        if (msgLower.includes('blue')) { color = '#0000FF'; colorName = 'blue'; }
        else if (msgLower.includes('green')) { color = '#00FF00'; colorName = 'green'; }
        else if (msgLower.includes('yellow')) { color = '#FFFF00'; colorName = 'yellow'; }
        
        if (result.node.style?.visual) {
          result.node.style.visual.color = color;
        }
        updatedLayout = JSON.parse(JSON.stringify(updatedLayout));
        explanation = `✅ Changed headline color to ${colorName}`;
      } else {
        explanation = "❌ Could not find the headline";
      }
    }
    
    // ============================================
    // COMMAND 9: Help
    // ============================================
    else if (msgLower.includes('help')) {
      explanation = "📚 **Commands you can try:**\n\n• 'hi' - Greeting\n• 'Convert to 9:16'\n• 'Convert to 16:9'\n• 'Make headline smaller/bigger'\n• 'Move headline to top'\n• 'Move offer badge higher'\n• 'Center the product'\n• 'Change headline color to blue'";
    }
    
    // ============================================
    // DEFAULT
    // ============================================
    else {
      console.log('❌ Unknown command:', msgLower);
      explanation = "⚠️ I couldn't process that request. Try:\n\n• 'Convert to 9:16'\n• 'Make headline smaller'\n• 'Move offer badge higher'\n• 'Center the product'\n\nOr type 'help' to see all commands";
    }
    
    res.json({ 
      updatedLayout, 
      explanation,
      success: true,
      usedLLM
    });
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      explanation: '❌ Sorry, something went wrong. Please try again.',
      success: false
    });
  }
});

export default router;