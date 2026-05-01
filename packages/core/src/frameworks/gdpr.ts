import type { ComplianceFramework } from "@trst/shared";

export const gdpr: ComplianceFramework = {
  id: "gdpr",
  name: "GDPR",
  version: "2018",
  controls: [
    {
      id: "gdpr-art5-1-a",
      frameworkId: "gdpr",
      ref: "Art. 5(1)(a)",
      title: "Lawfulness, Fairness, and Transparency",
      description:
        "Personal data shall be processed lawfully, fairly, and in a transparent manner in relation to the data subject.",
    },
    {
      id: "gdpr-art5-1-b",
      frameworkId: "gdpr",
      ref: "Art. 5(1)(b)",
      title: "Purpose Limitation",
      description:
        "Personal data shall be collected for specified, explicit, and legitimate purposes and not further processed in a manner incompatible with those purposes.",
    },
    {
      id: "gdpr-art5-1-e",
      frameworkId: "gdpr",
      ref: "Art. 5(1)(e)",
      title: "Storage Limitation",
      description:
        "Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary.",
    },
    {
      id: "gdpr-art5-1-f",
      frameworkId: "gdpr",
      ref: "Art. 5(1)(f)",
      title: "Integrity and Confidentiality",
      description:
        "Personal data shall be processed in a manner that ensures appropriate security, including protection against unauthorised or unlawful processing and against accidental loss, destruction, or damage.",
    },
    {
      id: "gdpr-art25",
      frameworkId: "gdpr",
      ref: "Art. 25",
      title: "Data Protection by Design and by Default",
      description:
        "The controller shall implement appropriate technical and organisational measures for ensuring that, by default, only personal data which are necessary for each specific purpose of the processing are processed.",
    },
    {
      id: "gdpr-art32",
      frameworkId: "gdpr",
      ref: "Art. 32",
      title: "Security of Processing",
      description:
        "The controller and processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including encryption of personal data.",
    },
    {
      id: "gdpr-art33",
      frameworkId: "gdpr",
      ref: "Art. 33",
      title: "Notification of Personal Data Breach",
      description:
        "In the case of a personal data breach, the controller shall notify the supervisory authority within 72 hours of becoming aware of the breach.",
    },
    {
      id: "gdpr-art35",
      frameworkId: "gdpr",
      ref: "Art. 35",
      title: "Data Protection Impact Assessment",
      description:
        "Where processing is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall carry out a data protection impact assessment.",
    },
  ],
};
