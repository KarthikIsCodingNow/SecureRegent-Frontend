import { LeadSource, ServiceCategory, ServiceItem } from "./types";

export const APP_NAME = "Secure-Regent";

export const SERVICES: ServiceItem[] = [
  { name: "Private Limited Company", category: "Company registration", minPrice: 7500, maxPrice: 15000 },
  { name: "LLP registration", category: "Company registration", minPrice: 6000, maxPrice: 12000 },
  { name: "One Person Company", category: "Company registration", minPrice: 5500, maxPrice: 10000 },
  { name: "Startup India registration", category: "Company registration", minPrice: 3500, maxPrice: 8000 },
  { name: "GST registration", category: "Tax and compliance", minPrice: 1500, maxPrice: 3500 },
  { name: "Annual compliance", category: "Tax and compliance", minPrice: 12000, maxPrice: 35000 },
  { name: "Penalty and late filing", category: "Tax and compliance", minPrice: 4000, maxPrice: 18000 },
  { name: "FSSAI licence", category: "Licences", minPrice: 4500, maxPrice: 15000 },
  { name: "Trademark registration", category: "Intellectual property", minPrice: 6500, maxPrice: 16000 },
  { name: "ISO certification", category: "Certifications", minPrice: 18000, maxPrice: 60000 },
  { name: "DSC and DIN", category: "Digital services", minPrice: 1500, maxPrice: 4500 },
  { name: "Website development", category: "Digital services", minPrice: 20000, maxPrice: 55000 }
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Company registration",
  "Tax and compliance",
  "Licences",
  "Intellectual property",
  "Certifications",
  "Digital services"
];

export const LEAD_SOURCES: LeadSource[] = [
  "Google Ads",
  "Website",
  "Just Dial",
  "Referral",
  "Social media",
  "Other"
];

export const SALES_TEAM = [
  "Rohan Sharma",
  "Ananya Iyer",
  "Vikram Malhotra",
  "Priya Deshmukh",
  "Rahul Verma",
  "Sneha Nambiar"
];

export const OPERATIONS_TEAM = [
  "Aditya Kulkarni",
  "Pooja Nair",
  "Rajesh Menon",
  "Kavita Pillai",
  "Deepak Chawla"
];

export const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Dhruv", "Kabir", "Rudra", "Rohan", "Atharva", "Om", "Dev", "Ananya", "Diya",
  "Saanvi", "Ira", "Aadhya", "Myra", "Aanya", "Pari", "Prisha", "Riya", "Avni", "Ahana",
  "Navya", "Kiara", "Kavya", "Sia", "Mira", "Shanaya", "Pooja", "Vikram", "Sneha", "Rahul",
  "Manish", "Gaurav", "Naveen", "Sunil", "Amit", "Harish", "Siddharth", "Kunal", "Nikhil", "Tarun",
  "Suresh", "Ramesh", "Deepak", "Alok", "Sameer", "Rajesh", "Varun", "Karan", "Abhishek", "Prateek",
  "Swati", "Neha", "Divya", "Tanvi", "Meera", "Pallavi", "Shreya", "Komal", "Ritika", "Payal"
];

export const INDIAN_SURNAMES = [
  "Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Kapoor", "Chopra", "Mehta", "Patel", "Shah",
  "Iyer", "Iyengar", "Nair", "Menon", "Pillai", "Nambiar", "Reddy", "Rao", "Chowdary", "Naidu",
  "Deshmukh", "Kulkarni", "Patil", "Joshi", "Bhide", "Chatterjee", "Banerjee", "Mukherjee", "Ghosh", "Sen",
  "Bose", "Das", "Roy", "Chakraborty", "Bhattacharya", "Agarwal", "Bansal", "Mittal", "Singhal", "Goel"
];

export const COMPANY_STEMS = [
  "Nexus Infotech", "Apex Logistics", "Zenith Health", "Horizon Ventures", "Trident Agro",
  "Solarium Energy", "Vanguard Retail", "Elysium Media", "Beacon Hospitality", "Strata Financial",
  "Paramount Exports", "Kalyan Textiles", "Crest Biotech", "Matrix Mobility", "Starlight Studios",
  "Omni Pharma", "Aura Consumer Goods", "Synergy Consultants", "Novus Cloud", "Pinnacle Engineering",
  "Vedic Organics", "Terra Infra", "Prism Digital", "Cosmos Marine", "Sterling Security",
  "Zenith Aerospace", "Equinox Metals", "Integra Polymers", "Lotus Lifestyle", "Falcon Packaging",
  "Dynamic Electronics", "Greenfield Bio", "Urban Haven Spaces", "Vitesse Automotives", "Radiant Diagnostics",
  "Bluechip Capital", "TrueNorth Advisors", "Indus Finserve", "Sahyadri Agrofoods", "Konkan Sea Freight"
];

export const INDIAN_CITIES = [
  "Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata",
  "Jaipur", "Lucknow", "Chandigarh", "Surat", "Indore", "Kochi", "Coimbatore", "Nagpur",
  "Patna", "Bhopal", "Vadodara", "Visakhapatnam"
];

export const DEFAULT_CHART_PALETTE = [
  "#3E6AE1",
  "#1FB6A6",
  "#F5A524",
  "#EF6B4A",
  "#2FBF71",
  "#6B7785",
  "#7FB2F0",
  "#D6B98C"
];

export const DEFAULT_MONTHLY_TARGET = 4500000;
