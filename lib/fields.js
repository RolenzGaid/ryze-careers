// Single source of truth for the application form.
// Used by the React form (rendering) and the API route (Google Doc generation),
// so labels and order always stay in sync.

export const SECTIONS = [
  {
    id: "applicant",
    title: "Applicant Information",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true, span: 8 },
      { name: "date", label: "Date", type: "date", required: true, span: 4 },
      { name: "address", label: "Full Address", type: "text", span: 12 },
      { name: "phone", label: "Phone Number", type: "tel", required: true, span: 4 },
      { name: "email", label: "Email", type: "email", required: true, span: 4 },
      { name: "dob", label: "Date of Birth", type: "date", required: true, span: 4 },
      { name: "dateAvailable", label: "Date Available", type: "date", required: true, span: 6 },
      { name: "desiredSalary", label: "Desired Salary", type: "number", span: 6 },
      { name: "position", label: "Position Applied For", type: "text", span: 12 },
      { name: "usCitizen", label: "Are you a citizen of the United States?", type: "radio", span: 6 },
      { name: "workAuthorized", label: "If no, are you authorized to work in the U.S.?", type: "radio", span: 6 },
      { name: "workedHereBefore", label: "Have you ever worked for this company?", type: "radio", span: 6 },
      { name: "workedHereWhen", label: "If yes, when?", type: "text", span: 6 },
      { name: "felony", label: "Have you ever been convicted of a felony?", type: "radio", span: 6 },
      { name: "felonyExplain", label: "If yes, explain", type: "text", span: 6 },
    ],
  },
  {
    id: "education",
    title: "Education",
    fields: [
      { name: "highSchool", label: "High School", type: "text", span: 5 },
      { name: "highSchoolAddress", label: "High School Address", type: "text", span: 7 },
      { name: "highSchoolFrom", label: "From", type: "number", span: 3 },
      { name: "highSchoolTo", label: "To", type: "number", span: 3 },
      { name: "highSchoolGraduate", label: "Did you graduate?", type: "radio", span: 3 },
      { name: "highSchoolDiploma", label: "Diploma", type: "text", span: 3 },

      { name: "college", label: "College", type: "text", span: 5 },
      { name: "collegeAddress", label: "College Address", type: "text", span: 7 },
      { name: "collegeFrom", label: "From", type: "number", span: 3 },
      { name: "collegeTo", label: "To", type: "number", span: 3 },
      { name: "collegeGraduate", label: "Did you graduate?", type: "radio", span: 3 },
      { name: "collegeDegree", label: "Degree", type: "text", span: 3 },

      { name: "otherSchool", label: "Other", type: "text", span: 5 },
      { name: "otherSchoolAddress", label: "Other Address", type: "text", span: 7 },
      { name: "otherFrom", label: "From", type: "number", span: 3 },
      { name: "otherTo", label: "To", type: "number", span: 3 },
      { name: "otherGraduate", label: "Did you graduate?", type: "radio", span: 3 },
      { name: "otherDegree", label: "Degree", type: "text", span: 3 },
    ],
  },
  {
    id: "employment",
    title: "Previous Employment",
    fields: [
      { name: "company", label: "Company", type: "text", span: 8 },
      { name: "companyPhone", label: "Phone", type: "tel", span: 4 },
      { name: "companyAddress", label: "Company Address", type: "text", span: 8 },
      { name: "supervisor", label: "Supervisor", type: "text", span: 4 },
      { name: "jobTitle", label: "Job Title", type: "text", span: 4 },
      { name: "startingSalary", label: "Starting Salary", type: "number", span: 4 },
      { name: "endingSalary", label: "Ending Salary", type: "number", span: 4 },
      { name: "responsibilities", label: "Responsibilities", type: "text", span: 12 },
      { name: "employmentFrom", label: "From", type: "number", span: 3 },
      { name: "employmentTo", label: "To", type: "number", span: 3 },
      { name: "reasonForLeaving", label: "Reason for Leaving", type: "text", span: 6 },
      { name: "contactSupervisor", label: "May we contact your previous supervisor for a reference?", type: "radio", span: 12 },
    ],
  },
  {
    id: "military",
    title: "Military Service",
    fields: [
      { name: "branch", label: "Branch", type: "text", span: 6 },
      { name: "militaryFrom", label: "From", type: "number", span: 3 },
      { name: "militaryTo", label: "To", type: "number", span: 3 },
      { name: "rankAtDischarge", label: "Rank at Discharge", type: "text", span: 6 },
      { name: "typeOfDischarge", label: "Type of Discharge", type: "text", span: 6 },
      { name: "dischargeExplain", label: "If other than honorable, explain", type: "text", span: 12 },
    ],
  },
  {
    id: "references",
    title: "References",
    fields: [
      { name: "referenceName", label: "Full Name", type: "text", span: 8 },
      { name: "referenceRelationship", label: "Relationship", type: "text", span: 4 },
      { name: "referenceCompany", label: "Company", type: "text", span: 8 },
      { name: "referencePhone", label: "Phone", type: "tel", span: 4 },
      { name: "referenceAddress", label: "Reference Address", type: "text", span: 12 },
    ],
  },
];

// Flat list of every field, handy for validation and doc building.
export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
