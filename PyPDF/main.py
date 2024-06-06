import fitz  # PyMuPDF

# Open the PDF file
doc = fitz.open('report.pdf')
# Load the first page
page = doc.load_page(0)
# Extract text from the page
text = page.get_text()

# Dictionary to store details
details = {
    "PATIENT NAME": "",
    "SEX": "",
    "AGE": "",
    "WEIGHT": "",
    "TEST TYPE": "COMPLETE BLOOD COUNT",
    "TEST": {
        "Haemoglobin": "",
        "RBC Count": "",
        "PCV": "",
        "RBC INDICES": {
            "MCV": "",
            "MCH": "",
            "MCHC": "",
            "RDW": ""
        },
        "TOTAL WBC COUNT": {
            "Total WBC Count": "",
            "Differential count": {
                "Neutrophils": "",
                "Lymphocytes": "",
                "Eosinophils": "",
                "Monocytes": "",
                "Basophils": ""
            },
            "Absolute Leucocyte Count":{
                "Absolute Neutrophil Count":"",
                "Absolute Lymphocyte Count":"",
                "Absolute Eosinophil Count":"",
                "Absolute Monocyte Count":"",
                "Absolute Basophils Count":"",}
            },
        "PLATELETS": {
            "Platelet Count": "",
            "Platelets on Smear": ""
        },
        "PERIPHERAL BLOOD SMEAR": {
            "RBC": "",
            "WBC": "",
            "Platelets": ""
        }
    }
}

# Split the text into lines
lines = text.split('\n')

i=0
# Iterate through lines to extract information
while i<len(lines):
    if "PATIENT NAME" in lines[i]:
        details["PATIENT NAME"] = lines[i + 1]
    elif "Male" in lines[i]:
        details["SEX"] = lines[i]
    elif "Female" in lines[i]:
        details["SEX"] = lines[i]
    elif "Years" in lines[i]:
        details["AGE"] = lines[i]
    elif "WEIGHT" in lines[i]:
        details["WEIGHT"] = lines[i + 1]
    
    
    elif "Haemoglobin" in lines[i]:
        details["TEST"]["Haemoglobin"] = lines[i + 1]
    
    elif "RBC  Count" in lines[i]:
        details["TEST"]["RBC Count"] = lines[i + 1]
    
    elif "PCV" in lines[i]:
        details["TEST"]["PCV"] = lines[i + 1]
    
    
    elif "MCV" in lines[i]:
        details["TEST"]["RBC INDICES"]["MCV"] = lines[i + 1]
    elif "MCH." in lines[i]:
        details["TEST"]["RBC INDICES"]["MCH"] = lines[i + 1]
    elif "MCHC" in lines[i]:
        details["TEST"]["RBC INDICES"]["MCHC"] = lines[i + 1]
    elif "RDW." in lines[i]:
        details["TEST"]["RBC INDICES"]["RDW"] = lines[i + 1]
    
    
    elif "Total WBC Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Total WBC Count"] = lines[i + 1]
    elif "Neutrophils" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Differential count"]["Neutrophils"] = lines[i + 1]
    elif "Lymphocytes" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Differential count"]["Lymphocytes"] = lines[i + 1]
    elif "Eosinophils" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Differential count"]["Eosinophils"] = lines[i + 1]
    elif "Monocytes" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Differential count"]["Monocytes"] = lines[i + 1]
    elif "Basophils" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Differential count"]["Basophils"] = lines[i + 1]


    elif "Absolute Neutrophil Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Absolute Leucocyte Count"]["Absolute Neutrophil Count"] = lines[i + 1]
    elif "Absolute Lymphocyte Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Absolute Leucocyte Count"]["Absolute Lymphocyte Count"] = lines[i + 1]
    elif "Absolute Eosinophil Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Absolute Leucocyte Count"]["Absolute Eosinophil Count"] = lines[i + 1]
    elif "Absolute Monocyte Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Absolute Leucocyte Count"]["Absolute Monocyte Count"] = lines[i + 1]
    elif "Absolute Basophils Count" in lines[i]:
        details["TEST"]["TOTAL WBC COUNT"]["Absolute Leucocyte Count"]["Absolute Basophils Count"] = lines[i + 1]
    
    
    elif "Platelet Count" in lines[i]:
        details["TEST"]["PLATELETS"]["Platelet Count"] = lines[i + 1]
    elif "Platelets on Smear" in lines[i]:
        details["TEST"]["PLATELETS"]["Platelets on Smear"] = lines[i + 1]
    
    
    elif "RBC Morphology" in lines[i]:
        details["TEST"]["PERIPHERAL BLOOD SMEAR"]["RBC"] = lines[i + 1]
    elif "WBCs on PS" in lines[i]:
        details["TEST"]["PERIPHERAL BLOOD SMEAR"]["WBC"] = lines[i + 1]
    elif "Platelets" in lines[i]:
        details["TEST"]["PERIPHERAL BLOOD SMEAR"]["Platelets"] = lines[i + 1]
    
    i=i+1

def print_details(details, indent=0):
    for key, value in details.items():
        if isinstance(value, dict):
            print("\t" * indent + key + ":")
            print_details(value, indent + 1)
        else:
            print("\t" * indent + f"{key}: {value}")

print_details(details)
