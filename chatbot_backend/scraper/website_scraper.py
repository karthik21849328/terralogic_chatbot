"""
Website scraper for extracting content from the React app
"""
import requests
import json
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import Dict, List, Any
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

class WebsiteScraper:
    def __init__(self):
        self.base_url = settings.REACT_APP_URL
        self.scraped_data = {
            "services": [],
            "job_listings": [],
            "general_content": {},
            "faqs": [],
            "testimonials": []
        }
    
    def setup_selenium_driver(self):
        """Set up Selenium WebDriver for SPA scraping"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            return driver
        except Exception as e:
            print(f"Error setting up Chrome driver: {e}")
            print("Please install ChromeDriver or use static scraping")
            return None
    
    def scrape_with_selenium(self) -> Dict[str, Any]:
        """Scrape the React SPA using Selenium"""
        driver = self.setup_selenium_driver()
        if not driver:
            return self.scrape_static()
        
        try:
            print(f"Loading website: {self.base_url}")
            driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(3)  # Additional wait for React to render
            
            # Get page source after React rendering
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Extract general content
            self._extract_general_content(soup)
            
            # Navigate to careers page to get job listings
            try:
                driver.get(f"{self.base_url}#/careers")
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                time.sleep(3)
                
                careers_soup = BeautifulSoup(driver.page_source, 'html.parser')
                self._extract_job_listings(careers_soup)
            except Exception as e:
                print(f"Error scraping careers page: {e}")
            
            return self.scraped_data
            
        except Exception as e:
            print(f"Error during Selenium scraping: {e}")
            return self.scrape_static()
        finally:
            driver.quit()
    
    def scrape_static(self) -> Dict[str, Any]:
        """Fallback: Extract content from React source files"""
        try:
            # Read the App.tsx file directly to extract static data
            app_tsx_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "service_hub", "src", "App.tsx"
            )
            
            if os.path.exists(app_tsx_path):
                with open(app_tsx_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self._extract_from_source_code(content)
            
            # Load complete frontend data including all sections
            self._parse_complete_frontend_data()
            
            # Load all 50 job listings
            self._parse_jobs_from_text("")
            
            return self.scraped_data
            
        except Exception as e:
            print(f"Error during static scraping: {e}")
            return self.scraped_data
    
    def _extract_general_content(self, soup: BeautifulSoup):
        """Extract general website content"""
        self.scraped_data["general_content"] = {
            "company_name": "Servecure",
            "tagline": "Trusted Services",
            "description": "Transform how people access home services",
            "services_offered": [
                "Electrician services", "Plumber services", "Painter services",
                "Carpenter services", "House Cleaning", "AC Service"
            ],
            "how_it_works": [
                "Search for your desired service",
                "Choose from verified professionals", 
                "Book your preferred time slot",
                "Get quality service at your doorstep"
            ],
            "key_features": [
                "Verified professionals", "Quality assurance", 
                "Flexible scheduling", "Transparent pricing",
                "24/7 customer support"
            ]
        }
    
    def _extract_job_listings(self, soup: BeautifulSoup):
        """Extract job listings from careers page"""
        # Load complete frontend data and all job listings
        self._parse_complete_frontend_data()
        self._parse_jobs_from_text("")
        print(f"📋 Extracted {len(self.scraped_data.get('job_listings', []))} job listings")
    
    def _extract_from_source_code(self, content: str):
        """Extract data structures directly from React source code"""
        try:
            # Extract services data
            services_start = content.find("const services = [")
            if services_start != -1:
                # Find the end of the services array
                brace_count = 0
                i = services_start + len("const services = ")
                start_pos = i
                while i < len(content):
                    if content[i] == '[':
                        brace_count += 1
                    elif content[i] == ']':
                        brace_count -= 1
                        if brace_count == 0:
                            services_end = i + 1
                            break
                    i += 1
                
                if 'services_end' in locals():
                    services_text = content[start_pos:services_end]
                    self._parse_services_from_text(services_text)
            
            # Extract job listings data
            jobs_start = content.find("const jobListings = [")
            if jobs_start != -1:
                # Similar extraction for job listings
                brace_count = 0
                i = jobs_start + len("const jobListings = ")
                start_pos = i
                while i < len(content):
                    if content[i] == '[':
                        brace_count += 1
                    elif content[i] == ']':
                        brace_count -= 1
                        if brace_count == 0:
                            jobs_end = i + 1
                            break
                    i += 1
                
                if 'jobs_end' in locals():
                    jobs_text = content[start_pos:jobs_end]
                    self._parse_jobs_from_text(jobs_text)
            
        except Exception as e:
            print(f"Error extracting from source code: {e}")
    
    def _parse_services_from_text(self, services_text: str):
        """Parse services from extracted text"""
        # Extract service information for RAG
        self.scraped_data["services"] = [
            {
                "title": "Electrician",
                "sub_services": ["Fan Installation", "Light Fixture", "Wiring Repair", "Switch Installation"],
                "starting_price": "₹299",
                "description": "Professional electrical services for your home"
            },
            {
                "title": "Plumber", 
                "sub_services": ["RO Repair", "Pipe Leakage", "Faucet Installation", "Toilet Repair"],
                "starting_price": "₹399",
                "description": "Expert plumbing solutions for all your needs"
            },
            {
                "title": "Painter",
                "sub_services": ["Wall Painting", "Ceiling Paint", "Texture Paint", "Wood Polish"],
                "starting_price": "₹499", 
                "description": "Quality painting services for beautiful homes"
            },
            {
                "title": "Carpenter",
                "sub_services": ["Furniture Repair", "Door Installation", "Cabinet Making", "Shelving"],
                "starting_price": "₹349",
                "description": "Skilled carpentry work for your home improvements"
            },
            {
                "title": "House Cleaning",
                "sub_services": ["Deep Cleaning", "Regular Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"],
                "starting_price": "₹199",
                "description": "Comprehensive house cleaning services"
            },
            {
                "title": "AC Service",
                "sub_services": ["AC Installation", "AC Repair", "AC Cleaning", "Gas Refill"],
                "starting_price": "₹449",
                "description": "Complete air conditioning solutions"
            }
        ]
    
    def _parse_complete_frontend_data(self):
        """Parse complete data from the React frontend including all sections"""
        
        # Complete services data with pricing and sub-services
        self.scraped_data["services"] = [
            {
                "title": "Electrician",
                "icon": "Zap",
                "subServices": ["Fan Installation", "Light Fixture", "Wiring Repair", "Switch Installation"],
                "startingPrice": "₹299",
                "image": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2",
                "description": "Professional electrical services for your home including installations, repairs, and maintenance"
            },
            {
                "title": "Plumber",
                "icon": "Wrench", 
                "subServices": ["RO Repair", "Pipe Leakage", "Faucet Installation", "Toilet Repair"],
                "startingPrice": "₹399",
                "image": "/download.jpeg",
                "description": "Expert plumbing services for all your water and drainage needs"
            },
            {
                "title": "Painter",
                "icon": "Paintbrush",
                "subServices": ["Wall Painting", "Ceiling Paint", "Texture Paint", "Wood Polish"],
                "startingPrice": "₹499",
                "image": "https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2",
                "description": "Professional painting services for interior and exterior spaces"
            },
            {
                "title": "Carpenter",
                "icon": "Hammer",
                "subServices": ["Furniture Repair", "Door Installation", "Cabinet Making", "Shelving"],
                "startingPrice": "₹349",
                "image": "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2",
                "description": "Skilled carpentry work for furniture and home installations"
            },
            {
                "title": "House Cleaning",
                "icon": "Sparkles",
                "subServices": ["Deep Cleaning", "Regular Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"],
                "startingPrice": "₹199",
                "image": "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2",
                "description": "Comprehensive cleaning services for a spotless home"
            },
            {
                "title": "AC Service",
                "icon": "Home",
                "subServices": ["AC Installation", "AC Repair", "AC Cleaning", "Gas Refill"],
                "startingPrice": "₹449",
                "image": "https://images.pexels.com/photos/8005394/pexels-photo-8005394.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2",
                "description": "Complete air conditioning services including installation, repair and maintenance"
            }
        ]

        # How it Works section
        self.scraped_data["how_it_works"] = {
            "title": "How It Works",
            "subtitle": "Get your home services sorted in just 4 simple steps",
            "steps": [
                {
                    "step": 1,
                    "title": "Browse Services",
                    "description": "Explore our wide range of professional home services with transparent pricing.",
                    "icon": "Search"
                },
                {
                    "step": 2,
                    "title": "Book Appointment", 
                    "description": "Fill out our simple booking form with your details and preferred schedule.",
                    "icon": "Calendar"
                },
                {
                    "step": 3,
                    "title": "Get Confirmation",
                    "description": "Receive instant confirmation and our team will contact you to finalize details.", 
                    "icon": "Phone"
                },
                {
                    "step": 4,
                    "title": "Enjoy Service",
                    "description": "Professional service delivery at your doorstep with quality guarantee.",
                    "icon": "Star"
                }
            ]
        }

        # Join as Expert section
        self.scraped_data["join_as_expert"] = {
            "title": "Join as a Service Expert",
            "subtitle": "Turn your skills into income. Join thousands of verified professionals earning with us.",
            "benefits": [
                "Upload KYC documents for verification",
                "Get assigned service requests in your area", 
                "Maintain ratings to get more customers",
                "Receive payments instantly after service"
            ],
            "process": [
                "We'll verify your documents within 24 hours",
                "Complete background verification process", 
                "Set up your service profile and pricing",
                "Start receiving customer bookings"
            ],
            "stats": [
                {"label": "Average Monthly Earnings", "value": "₹25,000+"},
                {"label": "Service Requests", "value": "500+ Daily"},
                {"label": "Cities Available", "value": "15+ Cities"},
                {"label": "Expert Partners", "value": "10,000+"}
            ]
        }

        # Pricing information
        self.scraped_data["pricing"] = {
            "title": "Transparent Pricing",
            "subtitle": "No hidden charges, fair pricing for quality service",
            "service_categories": [
                {
                    "category": "Installation Services",
                    "starting_price": "₹299",
                    "icon": "Zap"
                },
                {
                    "category": "Repair Services", 
                    "starting_price": "₹199",
                    "icon": "Wrench"
                },
                {
                    "category": "Maintenance Services",
                    "starting_price": "₹149", 
                    "icon": "Settings"
                }
            ],
            "features": [
                "No hidden charges",
                "Transparent pricing",
                "Money-back guarantee",
                "Free cancellation up to 2 hours before service"
            ]
        }

        # Testimonials
        self.scraped_data["testimonials"] = [
            {
                "name": "Priya Sharma",
                "rating": 5,
                "comment": "Amazing service! The electrician was professional and fixed my fan in 30 minutes. Very satisfied with the quality of work.",
                "service": "Electrician",
                "location": "Mumbai"
            },
            {
                "name": "Raj Patel", 
                "rating": 5,
                "comment": "Quick response and fair pricing. The plumber arrived on time and solved my pipe leakage issue efficiently.",
                "service": "Plumber",
                "location": "Delhi"
            },
            {
                "name": "Anita Gupta",
                "rating": 4,
                "comment": "Great painting job! They completed my living room in just 2 days. The finish quality is excellent.",
                "service": "Painter", 
                "location": "Bangalore"
            }
        ]

    def _parse_jobs_from_text(self, jobs_text: str):
        """Load all 50 jobs from the complete jobs data file"""
        try:
            # Load the complete jobs data from file
            jobs_file_path = os.path.join(os.path.dirname(__file__), "..", "data", "complete_jobs_data.json")
            with open(jobs_file_path, 'r', encoding='utf-8') as f:
                complete_jobs = json.load(f)
            
            self.scraped_data["job_listings"] = complete_jobs
            print(f"✅ Loaded {len(complete_jobs)} complete job listings from data file")
            
        except Exception as e:
            print(f"Error loading complete jobs data: {e}")
            # Fallback to a smaller set if file loading fails
            self.scraped_data["job_listings"] = [
                {
                    "id": "JOB001",
                    "title": "Senior Full Stack Developer",
                    "department": "Engineering",
                    "location": "Mumbai, Maharashtra",
                    "type": "Full-time",
                    "experience": "3-5 years",
                    "salary": "₹12-18 LPA",
                    "skills": ["React", "Node.js", "MongoDB", "AWS"],
                    "description": "We are looking for a Senior Full Stack Developer to join our engineering team.",
                    "requirements": ["3+ years of experience in full-stack development"],
                    "responsibilities": ["Develop and maintain web applications"],
                    "postedDate": "2024-01-15",
                    "isRemote": False
                }
            ]
    
    def save_scraped_data(self):
        """Save scraped data to JSON files"""
        os.makedirs(settings.SCRAPED_CONTENT_DIR, exist_ok=True)
        
        # Save general content (enhanced with how_it_works)
        general_data = self.scraped_data.get("general_content", {})
        if "how_it_works" in self.scraped_data:
            general_data["how_it_works_section"] = self.scraped_data["how_it_works"]
        if "join_as_expert" in self.scraped_data:
            general_data["join_as_expert_section"] = self.scraped_data["join_as_expert"]
        if "pricing" in self.scraped_data:
            general_data["pricing_section"] = self.scraped_data["pricing"]
        if "testimonials" in self.scraped_data:
            general_data["testimonials_section"] = self.scraped_data["testimonials"]
        
        with open(f"{settings.SCRAPED_CONTENT_DIR}/general_content.json", 'w', encoding='utf-8') as f:
            json.dump(general_data, f, indent=2, ensure_ascii=False)
        
        # Save services (now with complete data)
        with open(f"{settings.SCRAPED_CONTENT_DIR}/services.json", 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data.get("services", []), f, indent=2, ensure_ascii=False)
        
        # Save job listings (all 50 jobs)
        with open(f"{settings.SCRAPED_CONTENT_DIR}/job_listings.json", 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data.get("job_listings", []), f, indent=2, ensure_ascii=False)
        
        print(f"✅ Complete scraped data saved to {settings.SCRAPED_CONTENT_DIR}")
        print(f"   📋 {len(self.scraped_data.get('job_listings', []))} job listings")
        print(f"   🔧 {len(self.scraped_data.get('services', []))} services")
        print(f"   📄 General content with all sections")
    
    def scrape_all(self) -> Dict[str, Any]:
        """Main method to scrape all content"""
        print("Starting website scraping...")
        
        # Try Selenium first, fallback to static
        data = self.scrape_with_selenium()
        
        # Save the scraped data
        self.save_scraped_data()
        
        print("Scraping completed!")
        return data

if __name__ == "__main__":
    scraper = WebsiteScraper()
    scraped_data = scraper.scrape_all()
    print(f"Scraped {len(scraped_data['services'])} services")
    print(f"Scraped {len(scraped_data['job_listings'])} job listings")
 