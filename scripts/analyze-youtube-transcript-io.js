#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function analyzeYouTubeTranscriptIO() {
  console.log('🔍 Analyzing youtube-transcript.io network requests...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to capture network requests
  await page.setRequestInterception(true);
  
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    const headers = request.headers();
    const postData = request.postData();
    
    requests.push({
      url,
      method,
      headers,
      postData,
      timestamp: Date.now()
    });
    
    console.log(`📤 REQUEST: ${method} ${url}`);
    if (postData) {
      console.log(`📄 POST Data: ${postData.substring(0, 200)}${postData.length > 200 ? '...' : ''}`);
    }
    
    request.continue();
  });
  
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    const headers = response.headers();
    
    responses.push({
      url,
      status,
      headers,
      timestamp: Date.now()
    });
    
    console.log(`📥 RESPONSE: ${status} ${url}`);
    
    // If it's a JSON response, try to capture the data
    if (url.includes('api') || url.includes('transcript') || response.headers()['content-type']?.includes('application/json')) {
      response.text().then(text => {
        try {
          const data = JSON.parse(text);
          console.log(`📊 JSON Response for ${url}:`, JSON.stringify(data, null, 2).substring(0, 500));
        } catch (e) {
          console.log(`📄 Text Response for ${url}:`, text.substring(0, 200));
        }
      }).catch(e => {
        console.log(`❌ Could not read response for ${url}:`, e.message);
      });
    }
  });
  
  try {
    // Navigate to youtube-transcript.io
    console.log('🌐 Navigating to youtube-transcript.io...');
    await page.goto('https://youtube-transcript.io', { waitUntil: 'networkidle2' });
    
    console.log('✅ Loaded youtube-transcript.io');
    console.log('⏳ Waiting for page to fully load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Look for input field and enter a test YouTube URL
    console.log('🔍 Looking for YouTube URL input field...');
    const inputSelectors = [
      'input[placeholder*="youtube"]',
      'input[placeholder*="YouTube"]',
      'input[type="url"]',
      'input[type="text"]',
      'textarea',
      'input'
    ];
    
    let inputField = null;
    for (const selector of inputSelectors) {
      try {
        inputField = await page.$(selector);
        if (inputField) {
          console.log(`✅ Found input field with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (inputField) {
      // Enter a test YouTube URL
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll
      console.log(`📝 Entering test URL: ${testUrl}`);
      
      await inputField.click();
      await inputField.type(testUrl);
      
      // Look for submit button
      console.log('🔍 Looking for submit button...');
      const buttonSelectors = [
        'button[type="submit"]',
        'button:has-text("Get Transcript")',
        'button:has-text("Submit")',
        'button:has-text("Extract")',
        'button:has-text("Go")',
        'input[type="submit"]',
        'button'
      ];
      
      let submitButton = null;
      for (const selector of buttonSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton) {
            console.log(`✅ Found submit button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (submitButton) {
        console.log('🖱️ Clicking submit button...');
        await submitButton.click();
        
        console.log('⏳ Waiting for transcript extraction...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds for processing
        
        // Look for transcript results
        console.log('🔍 Looking for transcript results...');
        const resultSelectors = [
          '.transcript',
          '.result',
          '.output',
          '[class*="transcript"]',
          '[class*="result"]',
          '[class*="output"]',
          'pre',
          'code'
        ];
        
        for (const selector of resultSelectors) {
          try {
            const resultElement = await page.$(selector);
            if (resultElement) {
              const text = await resultElement.evaluate(el => el.textContent);
              if (text && text.length > 100) {
                console.log(`✅ Found transcript result with selector: ${selector}`);
                console.log(`📄 Transcript preview: ${text.substring(0, 500)}...`);
                break;
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      } else {
        console.log('❌ Could not find submit button');
      }
    } else {
      console.log('❌ Could not find input field');
    }
    
    // Wait a bit more to capture any additional requests
    console.log('⏳ Waiting for additional requests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('====================');
    console.log(`Total requests captured: ${requests.length}`);
    console.log(`Total responses captured: ${responses.length}`);
    
    // Filter and analyze API requests
    const apiRequests = requests.filter(req => 
      req.url.includes('api') || 
      req.url.includes('transcript') || 
      req.url.includes('youtube') ||
      req.url.includes('fetch')
    );
    
    console.log(`\n🔍 API Requests (${apiRequests.length}):`);
    apiRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`   POST Data: ${req.postData.substring(0, 100)}...`);
      }
    });
    
    // Save detailed logs
    const fs = require('fs');
    const logData = {
      timestamp: new Date().toISOString(),
      requests,
      responses,
      apiRequests
    };
    
    fs.writeFileSync('youtube-transcript-io-analysis.json', JSON.stringify(logData, null, 2));
    console.log('\n💾 Detailed analysis saved to youtube-transcript-io-analysis.json');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    console.log('🔧 Closing browser...');
    await browser.close();
  }
}

analyzeYouTubeTranscriptIO().catch(console.error); 