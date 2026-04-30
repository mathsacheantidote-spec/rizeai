// Curated list of major colleges/universities in India for the signup autocomplete.
// Not exhaustive — covers IITs, NITs, IIITs, IIMs, AIIMS, central & top private universities,
// and well-known engineering, medical, business, design, and arts institutes across India.

export const INDIA_COLLEGES: string[] = [
  // IITs
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur", "IIT Roorkee",
  "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT BHU Varanasi", "IIT Ropar", "IIT Patna",
  "IIT Mandi", "IIT Gandhinagar", "IIT Jodhpur", "IIT Bhubaneswar", "IIT Tirupati", "IIT Palakkad",
  "IIT Goa", "IIT Jammu", "IIT Dharwad", "IIT (ISM) Dhanbad",

  // NITs
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela", "NIT Allahabad (MNNIT)",
  "NIT Nagpur (VNIT)", "NIT Jaipur (MNIT)", "NIT Surat (SVNIT)", "NIT Kurukshetra", "NIT Durgapur",
  "NIT Silchar", "NIT Hamirpur", "NIT Jalandhar", "NIT Patna", "NIT Raipur", "NIT Srinagar",
  "NIT Agartala", "NIT Goa", "NIT Meghalaya", "NIT Manipur", "NIT Mizoram", "NIT Nagaland",
  "NIT Sikkim", "NIT Uttarakhand", "NIT Arunachal Pradesh", "NIT Andhra Pradesh", "NIT Delhi",
  "NIT Puducherry", "NIT Tadepalligudem",

  // IIITs
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Allahabad", "IIIT Delhi", "IIIT Gwalior",
  "IIIT Jabalpur", "IIIT Kancheepuram", "IIIT Lucknow", "IIIT Pune", "IIIT Vadodara", "IIIT Sri City",
  "IIIT Kottayam", "IIIT Kalyani", "IIIT Una", "IIIT Sonepat", "IIIT Manipur", "IIIT Nagpur",
  "IIIT Ranchi", "IIIT Surat", "IIIT Bhopal", "IIIT Bhagalpur", "IIIT Raichur",

  // IIMs
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow", "IIM Indore", "IIM Kozhikode",
  "IIM Shillong", "IIM Rohtak", "IIM Ranchi", "IIM Raipur", "IIM Trichy", "IIM Udaipur",
  "IIM Kashipur", "IIM Nagpur", "IIM Visakhapatnam", "IIM Bodh Gaya", "IIM Amritsar", "IIM Sambalpur",
  "IIM Sirmaur", "IIM Jammu", "IIM Mumbai",

  // AIIMS / medical
  "AIIMS Delhi", "AIIMS Bhopal", "AIIMS Bhubaneswar", "AIIMS Jodhpur", "AIIMS Patna", "AIIMS Raipur",
  "AIIMS Rishikesh", "AIIMS Nagpur", "AIIMS Mangalagiri", "AIIMS Gorakhpur", "AIIMS Kalyani",
  "AIIMS Bibinagar", "AIIMS Bilaspur", "AIIMS Deoghar", "AIIMS Rajkot", "AIIMS Guwahati", "AIIMS Vijaypur",
  "CMC Vellore", "AFMC Pune", "JIPMER Puducherry", "Maulana Azad Medical College Delhi",
  "King George's Medical University Lucknow", "Grant Medical College Mumbai", "Madras Medical College",
  "Lady Hardinge Medical College Delhi", "BJ Medical College Pune", "St. John's Medical College Bangalore",
  "Kasturba Medical College Manipal", "JSS Medical College Mysuru",

  // Central & deemed universities
  "Delhi University (DU)", "Jawaharlal Nehru University (JNU)", "Jamia Millia Islamia",
  "BHU Varanasi", "Banaras Hindu University", "AMU Aligarh", "University of Hyderabad",
  "University of Calcutta", "University of Mumbai", "Savitribai Phule Pune University",
  "University of Madras", "Anna University", "Osmania University", "Andhra University",
  "Visva-Bharati University", "Pondicherry University", "Tezpur University", "NEHU Shillong",
  "Mizoram University", "Manipur University", "Nagaland University", "Sikkim University",
  "Tripura University", "Central University of Rajasthan", "Central University of Punjab",
  "Central University of Karnataka", "Central University of Tamil Nadu", "Central University of Kerala",
  "Central University of Jharkhand", "Central University of Gujarat", "Central University of Haryana",
  "Central University of Himachal Pradesh", "Central University of Jammu", "Central University of Kashmir",

  // BITS / private engineering
  "BITS Pilani", "BITS Pilani Goa", "BITS Pilani Hyderabad", "BITS Pilani Dubai",
  "VIT Vellore", "VIT Chennai", "VIT-AP Amaravati", "VIT Bhopal",
  "SRM Institute of Science and Technology Chennai", "SRM University AP", "SRMIST NCR Ghaziabad",
  "Manipal Institute of Technology (MIT Manipal)", "MAHE Manipal", "Manipal University Jaipur",
  "Thapar Institute Patiala", "PEC Chandigarh", "PSG College of Technology Coimbatore",
  "SSN College of Engineering Chennai", "Amrita Vishwa Vidyapeetham Coimbatore",
  "Amrita School of Engineering Bangalore", "Amrita School of Engineering Amritapuri",
  "Amity University Noida", "Amity University Mumbai", "Amity University Gurgaon",
  "Amity University Lucknow", "LPU Phagwara (Lovely Professional University)",
  "Bennett University Greater Noida", "Shiv Nadar University", "Ashoka University",
  "OP Jindal Global University", "Chandigarh University", "Christ University Bangalore",
  "JIIT Noida", "JNTU Hyderabad", "JNTU Kakinada", "JNTU Anantapur",
  "DTU Delhi (Delhi Technological University)", "NSUT Delhi (Netaji Subhas)", "IGDTUW Delhi",
  "DAIICT Gandhinagar", "Nirma University Ahmedabad", "PDPU Gandhinagar (Pandit Deendayal)",
  "MNIT Allahabad", "BIT Mesra", "BIT Sindri", "IIEST Shibpur", "Jadavpur University",
  "RV College of Engineering Bangalore", "BMS College of Engineering Bangalore",
  "MS Ramaiah Institute of Technology Bangalore", "PES University Bangalore",
  "Dayananda Sagar College of Engineering Bangalore", "BMS Institute of Technology Bangalore",
  "NMIMS Mumbai", "KJ Somaiya College of Engineering Mumbai", "VJTI Mumbai", "ICT Mumbai",
  "Sardar Patel Institute of Technology Mumbai", "Don Bosco Institute of Technology Mumbai",
  "COEP Pune (College of Engineering Pune)", "MIT WPU Pune", "VIIT Pune", "PICT Pune",
  "Symbiosis Institute of Technology Pune", "Symbiosis Centre for Management Studies Pune",
  "Symbiosis Law School Pune",

  // Business / law / design / arts
  "XLRI Jamshedpur", "MDI Gurgaon", "FMS Delhi", "SP Jain Institute Mumbai", "JBIMS Mumbai",
  "ISB Hyderabad", "Great Lakes Institute of Management Chennai", "IMT Ghaziabad",
  "TAPMI Manipal", "IIFT Delhi", "IIFT Kolkata", "NMIMS School of Business Management Mumbai",
  "NLSIU Bangalore", "NALSAR Hyderabad", "NLU Delhi", "NLU Jodhpur", "WBNUJS Kolkata",
  "GNLU Gandhinagar", "NLIU Bhopal", "HNLU Raipur", "RMLNLU Lucknow", "NUALS Kochi",
  "Symbiosis Law School Hyderabad",
  "NID Ahmedabad", "NID Bangalore", "NID Gandhinagar", "IDC IIT Bombay",
  "Srishti Manipal Institute Bangalore", "Pearl Academy Delhi", "MIT Institute of Design Pune",
  "NIFT Delhi", "NIFT Mumbai", "NIFT Bangalore", "NIFT Chennai", "NIFT Kolkata", "NIFT Hyderabad",
  "JJ School of Art Mumbai", "FTII Pune", "SRFTI Kolkata", "Whistling Woods International Mumbai",

  // State / regional flagships
  "Anna University Chennai", "MIT Chennai (Madras Institute of Technology)",
  "CEG Chennai (College of Engineering Guindy)", "Jadavpur University Kolkata",
  "Kerala University", "CUSAT Kochi", "Government Engineering College Trivandrum",
  "MES College of Engineering Kuttippuram", "NIT Calicut", "TKM College of Engineering Kollam",
  "PSG Tech Coimbatore", "Coimbatore Institute of Technology", "Government College of Technology Coimbatore",
  "Bangalore University", "Bangalore Institute of Technology",
  "Osmania University College of Engineering Hyderabad", "JNAFAU Hyderabad",
  "Andhra University College of Engineering Visakhapatnam", "GITAM Visakhapatnam",
  "KL University Vijayawada", "VIT-AP", "SRM AP",
  "Punjab Engineering College Chandigarh", "Punjab University Chandigarh",
  "Jamia Hamdard Delhi", "Guru Gobind Singh Indraprastha University Delhi",
  "Aligarh Muslim University", "MMM University of Technology Gorakhpur",
  "Harcourt Butler Technical University Kanpur", "Madan Mohan Malaviya University Gorakhpur",
  "AKTU Lucknow", "GLA University Mathura", "Galgotias University Greater Noida",
  "KIIT Bhubaneswar", "ITER Bhubaneswar (SOA University)", "VSSUT Burla",
  "NIT Rourkela", "CET Bhubaneswar",
  "Calcutta Institute of Engineering and Management", "Heritage Institute of Technology Kolkata",
  "Techno India Salt Lake", "Indian Institute of Engineering Science and Technology Shibpur",
  "Assam Engineering College Guwahati", "NERIST Itanagar",
  "Rajiv Gandhi University Itanagar", "Gauhati University", "Dibrugarh University",
];
