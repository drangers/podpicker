import puppeteer, { Browser, Page } from 'puppeteer';
import { scrapeYouTubeTranscriptUnified } from './youtube-transcript-unified';

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface YouTubeTranscript {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  fullText: string;
}

export class YouTubeTranscriptScraper {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Puppeteer browser...');
    this.browser = await puppeteer.launch({
      headless: true, // Use headless mode for server compatibility
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    console.log('✅ Browser initialized successfully');
  }

  async close(): Promise<void> {
    console.log('🔧 Closing browser...');
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Browser closed successfully');
    }
  }

  async getTranscript(videoUrl: string): Promise<YouTubeTranscript> {
    console.log('🚀 Starting transcript extraction process...');
    console.log(`📹 Video URL: ${videoUrl}`);
    
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    console.log('📄 New page created');
    
    try {
      // Set user agent to appear more like a real browser
      console.log('🔧 Setting user agent...');
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      console.log('✅ User agent set');
      
      // Set viewport
      console.log('🔧 Setting viewport...');
      await page.setViewport({ width: 1280, height: 720 });
      console.log('✅ Viewport set to 1280x720');
      
      // Navigate to the YouTube video
      console.log('🌐 Navigating to YouTube video...');
      console.log(`📍 Target URL: ${videoUrl}`);
      await page.goto(videoUrl, { waitUntil: 'networkidle2' });
      console.log('✅ Navigation completed, waiting for network idle');
      
      // Wait for the page to load using a more reliable method
      console.log('⏳ Waiting for page to fully load...');
      await this.delay(3000);
      console.log('✅ Page load wait completed');
      
      // Get video title
      console.log('📝 Extracting video title...');
      const title = await page.$eval('h1.ytd-video-primary-info-renderer', 
        (el) => el.textContent?.trim() || 'Unknown Title'
      ).catch(() => 'Unknown Title');
      console.log(`✅ Video title extracted: "${title}"`);
      
      // Extract video ID from URL
      const videoId = this.extractVideoId(videoUrl);
      console.log(`🎬 Video ID extracted: ${videoId}`);
      
      // Try to find and click the transcript button
      console.log('🔍 Starting transcript panel opening process...');
      await this.openTranscriptPanel(page);
      
      // Wait for transcript to load
      console.log('⏳ Waiting for transcript to load...');
      await this.delay(2000);
      console.log('✅ Transcript load wait completed');
      
      // Extract transcript segments
      console.log('📖 Extracting transcript segments...');
      const segments = await this.extractTranscriptSegments(page);
      
      if (segments.length === 0) {
        console.log('❌ No transcript segments found');
        await this.captureErrorScreenshot(page, 'no-transcript-segments');
        throw new Error('No transcript segments found. The video might not have a transcript available.');
      }
      
      console.log(`✅ Successfully extracted ${segments.length} transcript segments`);
      
      // Combine all text
      const fullText = segments.map(segment => segment.text).join(' ');
      console.log(`📄 Full transcript text length: ${fullText.length} characters`);
      
      return {
        videoId,
        title,
        segments,
        fullText
      };
      
    } catch (error) {
      console.log('❌ Error during transcript extraction:', error);
      await this.captureErrorScreenshot(page, 'transcript-extraction-error');
      throw error;
    } finally {
      console.log('🔧 Closing page...');
      await page.close();
      console.log('✅ Page closed');
    }
  }

  private async captureErrorScreenshot(page: Page, errorType: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `error-${errorType}-${timestamp}.png` as const;
      console.log(`📸 Capturing error screenshot: ${filename}`);
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`✅ Error screenshot saved: ${filename}`);
    } catch (screenshotError) {
      console.log('❌ Failed to capture error screenshot:', screenshotError);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }

  private async openTranscriptPanel(page: Page): Promise<void> {
    console.log('🔍 Starting transcript panel opening process...');
    
    try {
      // Method 1: First try to expand description by clicking "...more" button, then find "Show transcript"
      console.log('🔍 Method 1: Looking for "...more" button to expand description...');
      
      // Look for the "...more" button to expand the description
      try {
        console.log('🔍 Searching for "...more" button with various selectors...');
        const moreButtonSelectors = [
          'button:has-text("...more")',
          'button:has-text("SHOW MORE")',
          'button[aria-label*="more"]',
          'button[aria-label*="More"]',
          'button[aria-label*="Show more"]',
          'button[aria-label*="show more"]'
        ];
        
        let moreButton = null;
        for (const selector of moreButtonSelectors) {
          try {
            console.log(`🔍 Trying selector: ${selector}`);
            moreButton = await page.waitForSelector(selector, { timeout: 2000 });
            if (moreButton) {
              console.log(`✅ Found "...more" button with selector: ${selector}`);
              break;
            }
          } catch (error) {
            console.log(`❌ Selector ${selector} not found`);
          }
        }
        
        if (moreButton) {
          console.log('🖱️ Clicking "...more" button to expand description...');
          await moreButton.click();
          console.log('✅ "...more" button clicked');
          console.log('⏳ Waiting for description to expand...');
          await this.delay(2000);
          console.log('✅ Description expansion wait completed');
        } else {
          console.log('ℹ️ No "...more" button found, description might already be expanded');
        }
      } catch (error) {
        console.log('❌ Error finding "...more" button:', error);
      }

      // Now look for the "Show transcript" button in the expanded description
      console.log('🔍 Looking for "Show transcript" button in expanded description...');
      try {
        const showTranscriptSelectors = [
          'button:has-text("Show transcript")',
          'button:has-text("SHOW TRANSCRIPT")',
          'a:has-text("Show transcript")',
          'button[aria-label*="Show transcript"]',
          'button[aria-label*="show transcript"]'
        ];
        
        let showTranscriptButton = null;
        for (const selector of showTranscriptSelectors) {
          try {
            console.log(`🔍 Trying selector: ${selector}`);
            showTranscriptButton = await page.waitForSelector(selector, { timeout: 3000 });
            if (showTranscriptButton) {
              console.log(`✅ Found "Show transcript" button with selector: ${selector}`);
              break;
            }
          } catch (error) {
            console.log(`❌ Selector ${selector} not found`);
          }
        }
        
        if (showTranscriptButton) {
          console.log('🖱️ Clicking "Show transcript" button...');
          await showTranscriptButton.click();
          console.log('✅ "Show transcript" button clicked');
          return;
        } else {
          console.log('❌ Show transcript button not found in expanded description');
        }
      } catch (error) {
        console.log('❌ Error finding "Show transcript" button in description:', error);
      }

      // Method 2: Look for the transcript button in the video player
      console.log('🔍 Method 2: Looking for transcript button in video player...');
      const transcriptButtonSelectors = [
        'button[aria-label*="transcript"]',
        'button[aria-label*="Transcript"]',
        'ytd-button-renderer[aria-label*="transcript"]',
        'button[data-tooltip*="transcript"]',
        'button[data-tooltip*="Transcript"]',
        '.ytp-button[aria-label*="transcript"]',
        'button:has-text("transcript")',
        'button:has-text("Transcript")'
      ];
      
      for (const selector of transcriptButtonSelectors) {
        try {
          console.log(`🔍 Trying video player selector: ${selector}`);
          const transcriptButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (transcriptButton) {
            console.log(`✅ Found transcript button with selector: ${selector}`);
            console.log('🖱️ Clicking transcript button...');
            await transcriptButton.click();
            console.log('✅ Transcript button clicked');
            return;
          }
        } catch (error) {
          console.log(`❌ Video player selector ${selector} not found`);
        }
      }
      
      console.log('❌ Transcript button not found in video player');
    } catch (error) {
      console.log('❌ Error in Method 2:', error);
    }

    // Method 3: Try to find transcript in the description area
    console.log('🔍 Method 3: Checking if transcript section is already visible...');
    try {
      const transcriptSection = await page.waitForSelector('ytd-transcript-segment-renderer', { timeout: 3000 });
      if (transcriptSection) {
        console.log('✅ Transcript section already visible');
        return;
      }
    } catch (error) {
      console.log('❌ Transcript section not found');
    }

    // Method 4: Try clicking on the "..." menu and look for transcript option
    console.log('🔍 Method 4: Trying to find menu button and transcript option...');
    try {
      const menuButtonSelectors = [
        'button[aria-label*="More actions"]',
        'button[aria-label*="More"]',
        'button[aria-label*="more actions"]',
        'button[aria-label*="menu"]'
      ];
      
      let menuButton = null;
      for (const selector of menuButtonSelectors) {
        try {
          console.log(`🔍 Trying menu button selector: ${selector}`);
          menuButton = await page.waitForSelector(selector, { timeout: 2000 });
          if (menuButton) {
            console.log(`✅ Found menu button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Menu button selector ${selector} not found`);
        }
      }
      
      if (menuButton) {
        console.log('🖱️ Clicking menu button...');
        await menuButton.click();
        console.log('✅ Menu button clicked');
        console.log('⏳ Waiting for menu to open...');
        await this.delay(1000);
        console.log('✅ Menu open wait completed');
        
        // Look for transcript option in the menu
        const transcriptOptionSelectors = [
          'tp-yt-paper-item:has-text("Show transcript")',
          'ytd-menu-service-item:has-text("Show transcript")',
          'div:has-text("Show transcript")',
          'span:has-text("Show transcript")'
        ];
        
        for (const selector of transcriptOptionSelectors) {
          try {
            console.log(`🔍 Trying transcript option selector: ${selector}`);
            const transcriptOption = await page.waitForSelector(selector, { timeout: 2000 });
            if (transcriptOption) {
              console.log(`✅ Found transcript option with selector: ${selector}`);
              console.log('🖱️ Clicking transcript option...');
              await transcriptOption.click();
              console.log('✅ Transcript option clicked');
              return;
            }
          } catch (error) {
            console.log(`❌ Transcript option selector ${selector} not found`);
          }
        }
        console.log('❌ Transcript option not found in menu');
      } else {
        console.log('❌ Menu button not found');
      }
    } catch (error) {
      console.log('❌ Error in Method 4:', error);
    }

    // Method 5: Try to find the transcript button in the video player area with more specific selectors
    console.log('🔍 Method 5: Trying to find transcript button in video player area with specific selectors...');
    try {
      const selectors = [
        'button[aria-label*="transcript"]',
        'button[aria-label*="Transcript"]',
        'ytd-button-renderer[aria-label*="transcript"]',
        'button[data-tooltip*="transcript"]',
        'button[data-tooltip*="Transcript"]',
        '.ytp-button[aria-label*="transcript"]',
        'button:has-text("transcript")',
        'button:has-text("Transcript")'
      ];
      
      for (const selector of selectors) {
        try {
          console.log(`🔍 Trying specific selector: ${selector}`);
          const button = await page.waitForSelector(selector, { timeout: 2000 });
          if (button) {
            console.log(`✅ Found transcript button with selector: ${selector}`);
            console.log('🖱️ Clicking transcript button...');
            await button.click();
            console.log('✅ Transcript button clicked');
            return;
          }
        } catch (error) {
          console.log(`❌ Specific selector ${selector} not found`);
        }
      }
      console.log('❌ Video player area method failed');
    } catch (error) {
      console.log('❌ Error in Method 5:', error);
    }

    // Method 6: Try to scroll down and look for transcript in description
    console.log('🔍 Method 6: Trying to scroll down and look for transcript in description...');
    try {
      console.log('📜 Scrolling to bottom of page...');
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      console.log('✅ Scrolled to bottom');
      console.log('⏳ Waiting for content to load...');
      await this.delay(2000);
      console.log('✅ Scroll wait completed');
      
      // Look for transcript in the description area
      const transcriptLinkSelectors = [
        'a[href*="transcript"]',
        'button:has-text("Show transcript")',
        'a:has-text("Show transcript")',
        'span:has-text("Show transcript")'
      ];
      
      for (const selector of transcriptLinkSelectors) {
        try {
          console.log(`🔍 Trying transcript link selector: ${selector}`);
          const transcriptLink = await page.waitForSelector(selector, { timeout: 2000 });
          if (transcriptLink) {
            console.log(`✅ Found transcript link with selector: ${selector}`);
            console.log('🖱️ Clicking transcript link...');
            await transcriptLink.click();
            console.log('✅ Transcript link clicked');
            return;
          }
        } catch (error) {
          console.log(`❌ Transcript link selector ${selector} not found`);
        }
      }
      console.log('❌ Description area method failed');
    } catch (error) {
      console.log('❌ Error in Method 6:', error);
    }

    // Method 7: Try to find the transcript button by looking for any element with transcript-related text
    console.log('🔍 Method 7: Trying to find any element with transcript-related text...');
    try {
      console.log('🔍 Getting all page elements...');
      const transcriptElements = await page.$$('*');
      console.log(`📊 Found ${transcriptElements.length} total elements on page`);
      
      let foundTranscriptElement = false;
      for (let i = 0; i < Math.min(transcriptElements.length, 100); i++) { // Limit to first 100 elements for performance
        try {
          const element = transcriptElements[i];
          const text = await element.evaluate(el => el.textContent?.toLowerCase() || '');
          if (text.includes('transcript') || text.includes('show transcript')) {
            console.log(`✅ Found element with transcript text: "${text.substring(0, 50)}..."`);
            console.log('🖱️ Clicking element with transcript text...');
            await element.click();
            console.log('✅ Element with transcript text clicked');
            foundTranscriptElement = true;
            return;
          }
        } catch (error) {
          // Continue to next element
        }
      }
      
      if (!foundTranscriptElement) {
        console.log('❌ No elements with transcript text found');
      }
    } catch (error) {
      console.log('❌ Error in Method 7:', error);
    }

    // Debug: Take a screenshot to see what's on the page
    console.log('📸 Taking screenshot for debugging...');
    try {
      await page.screenshot({ path: 'youtube-debug.png', fullPage: true });
      console.log('✅ Screenshot saved as youtube-debug.png');
    } catch (error) {
      console.log('❌ Failed to take screenshot:', error);
    }

    console.log('❌ All methods failed to find transcript panel');
    throw new Error('Could not find or open transcript panel. The video might not have a transcript available.');
  }

  private async extractTranscriptSegments(page: Page): Promise<TranscriptSegment[]> {
    console.log('📖 Starting transcript segment extraction...');
    const segments: TranscriptSegment[] = [];
    
    try {
      // Wait for transcript segments to load with multiple possible selectors
      console.log('⏳ Waiting for transcript segments to load...');
      
      // First, wait a bit for dynamic content to load
      console.log('⏳ Waiting for dynamic content to load...');
      await this.delay(3000);
      console.log('✅ Dynamic content wait completed');
      
      // Take a screenshot to see what's on the page
      console.log('📸 Taking screenshot for transcript debugging...');
      try {
        await page.screenshot({ path: 'transcript-debug.png', fullPage: true });
        console.log('✅ Screenshot saved as transcript-debug.png');
      } catch (error) {
        console.log('❌ Failed to take screenshot:', error);
      }
      
      // Get the page HTML to debug
      console.log('🔍 Getting page HTML for debugging...');
      const pageHTML = await page.content();
      console.log(`📄 Page HTML length: ${pageHTML.length} characters`);
      
      const possibleSelectors = [
        'ytd-transcript-segment-renderer',
        '.ytd-transcript-segment-renderer',
        '[data-segment-start-time]',
        '.transcript-segment',
        '.ytd-transcript-renderer .segment',
        '.ytd-transcript-segment-renderer',
        '.ytd-transcript-renderer',
        '.transcript-item',
        '.transcript-text',
        '.ytd-transcript-segment-renderer .segment-text',
        '.ytd-transcript-segment-renderer .segment-timestamp',
        '.transcript-panel',
        '.transcript-container'
      ];
      
      let transcriptSelector = null;
      console.log('🔍 Testing possible transcript selectors...');
      for (const selector of possibleSelectors) {
        try {
          console.log(`🔍 Testing selector: ${selector}`);
          await page.waitForSelector(selector, { timeout: 3000 });
          transcriptSelector = selector;
          console.log(`✅ Found transcript elements with selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`❌ Selector ${selector} not found`);
        }
      }
      
      if (!transcriptSelector) {
        console.log('❌ No transcript selectors found, trying alternative extraction...');
        return await this.extractTranscriptAlternative(page);
      }
      
      // Extract all transcript segments
      console.log(`🔍 Extracting segments with selector: ${transcriptSelector}`);
      const segmentElements = await page.$$(transcriptSelector);
      console.log(`📊 Found ${segmentElements.length} transcript segment elements`);
      
      for (let i = 0; i < segmentElements.length; i++) {
        try {
          console.log(`📝 Processing segment ${i + 1}/${segmentElements.length}...`);
          const element = segmentElements[i];
          
          // Get timestamp
          console.log(`🔍 Looking for timestamp in segment ${i + 1}...`);
          const timestampElement = await element.$('.ytd-transcript-segment-renderer .segment-timestamp');
          const timestampText = timestampElement ? await timestampElement.evaluate(el => el.textContent?.trim()) : '';
          console.log(`⏰ Timestamp for segment ${i + 1}: "${timestampText}"`);
          
          // Get text
          console.log(`🔍 Looking for text in segment ${i + 1}...`);
          const textElement = await element.$('.ytd-transcript-segment-renderer .segment-text');
          const text = textElement ? await textElement.evaluate(el => el.textContent?.trim()) : '';
          console.log(`📄 Text for segment ${i + 1}: "${text!.substring(0, 50)}${text!.length > 50 ? '...' : ''}"`);
          
          if (timestampText && text) {
            const start = this.parseTimestamp(timestampText);
            console.log(`⏱️ Parsed start time for segment ${i + 1}: ${start} seconds`);
            segments.push({
              start,
              duration: 0, // YouTube doesn't show duration in UI
              text
            });
            console.log(`✅ Segment ${i + 1} added successfully`);
          } else {
            console.log(`❌ Segment ${i + 1} missing timestamp or text`);
          }
        } catch (error) {
          console.log(`❌ Error extracting segment ${i + 1}:`, error);
        }
      }
      
      console.log(`📊 Successfully extracted ${segments.length} segments out of ${segmentElements.length} elements`);
      
      // If no segments found with the above method, try alternative selectors
      if (segments.length === 0) {
        console.log('❌ No segments found with primary method, trying alternative extraction...');
        const alternativeSegments = await this.extractTranscriptAlternative(page);
        segments.push(...alternativeSegments);
        console.log(`📊 Alternative method found ${alternativeSegments.length} segments`);
      }
      
    } catch (error) {
      console.log('❌ Error extracting transcript segments:', error);
    }
    
    console.log(`📊 Final segment count: ${segments.length}`);
    return segments;
  }

  private async extractTranscriptAlternative(page: Page): Promise<TranscriptSegment[]> {
    console.log('🔍 Starting alternative transcript extraction...');
    const segments: TranscriptSegment[] = [];
    
    try {
      // Try different selectors for transcript content
      const selectors = [
        '.ytd-transcript-segment-renderer',
        '[data-segment-start-time]',
        '.transcript-segment',
        '.ytd-transcript-renderer .segment',
        '.ytd-transcript-segment-renderer',
        '.transcript-item',
        '.transcript-text',
        '.ytd-transcript-renderer',
        '.transcript-panel',
        '.ytd-transcript-segment-renderer .segment-text'
      ];
      
      for (const selector of selectors) {
        try {
          console.log(`🔍 Trying alternative selector: ${selector}`);
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            console.log(`📊 Found ${elements.length} elements with selector: ${selector}`);
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              const text = await element.evaluate(el => el.textContent?.trim());
              if (text) {
                console.log(`📝 Alternative element ${i + 1} text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
                
                // Try to extract timestamp from the element or its attributes
                const startTime = await element.evaluate(el => {
                  const timeAttr = el.getAttribute('data-segment-start-time');
                  if (timeAttr) return parseFloat(timeAttr);
                  
                  // Look for timestamp in text content
                  const timeMatch = el.textContent?.match(/(\d+):(\d+)/);
                  if (timeMatch) {
                    const minutes = parseInt(timeMatch[1]);
                    const seconds = parseInt(timeMatch[2]);
                    return minutes * 60 + seconds;
                  }
                  return 0;
                });
                
                console.log(`⏱️ Alternative element ${i + 1} start time: ${startTime} seconds`);
                segments.push({
                  start: startTime,
                  duration: 0,
                  text: text
                });
                console.log(`✅ Alternative element ${i + 1} added`);
              }
            }
            break; // Found segments with this selector
          }
        } catch (error) {
          console.log(`❌ Alternative selector ${selector} failed:`, error);
        }
      }
      
      // If still no segments, try to extract from the entire transcript area
      if (segments.length === 0) {
        console.log('🔍 Trying to extract from entire transcript area...');
        const transcriptArea = await page.$('.ytd-transcript-renderer, .transcript-panel, .transcript-container');
        if (transcriptArea) {
          console.log('✅ Found transcript area');
          const fullText = await transcriptArea.evaluate(el => el.textContent?.trim() || '');
          console.log(`📄 Full transcript area text length: ${fullText.length} characters`);
          
          if (fullText) {
            // Split by lines and try to parse timestamps
            const lines = fullText.split('\n').filter(line => line.trim());
            console.log(`📊 Found ${lines.length} lines in transcript area`);
            let currentTime = 0;
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const timeMatch = line.match(/(\d+):(\d+)/);
              if (timeMatch) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                currentTime = minutes * 60 + seconds;
                console.log(`⏱️ Line ${i + 1} timestamp: ${currentTime} seconds`);
              } else if (line.trim() && currentTime >= 0) {
                console.log(`📝 Line ${i + 1} text: "${line.trim().substring(0, 50)}${line.trim().length > 50 ? '...' : ''}"`);
                segments.push({
                  start: currentTime,
                  duration: 0,
                  text: line.trim()
                });
                console.log(`✅ Line ${i + 1} added as segment`);
              }
            }
          }
        } else {
          console.log('❌ No transcript area found');
        }
      }
    } catch (error) {
      console.log('❌ Alternative extraction failed:', error);
    }
    
    console.log(`📊 Alternative extraction found ${segments.length} segments`);
    return segments;
  }

  private parseTimestamp(timestamp: string): number {
    console.log(`⏱️ Parsing timestamp: "${timestamp}"`);
    // Parse timestamp in format "0:00" or "1:23:45"
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      const result = parts[0] * 60 + parts[1];
      console.log(`✅ Parsed timestamp: ${result} seconds`);
      return result;
    } else if (parts.length === 3) {
      const result = parts[0] * 3600 + parts[1] * 60 + parts[2];
      console.log(`✅ Parsed timestamp: ${result} seconds`);
      return result;
    }
    console.log(`❌ Could not parse timestamp: "${timestamp}"`);
    return 0;
  }
}

// Utility function to create and use the scraper
export async function scrapeYouTubeTranscript(videoUrl: string): Promise<YouTubeTranscript> {
  console.log('🚀 Starting YouTube transcript scraping process...');
  console.log(`📹 Video URL: ${videoUrl}`);
  
  try {
    console.log('🔧 Using unified implementation...');
    const result = await scrapeYouTubeTranscriptUnified(videoUrl);
    console.log('✅ Transcript scraping completed successfully');
    return result;
  } catch (error) {
    console.log('❌ Error during transcript scraping:', error);
    throw error;
  }
} 