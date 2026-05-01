import type { ComplianceFramework } from "@trst/shared";

export const hipaa: ComplianceFramework = {
  id: "hipaa",
  name: "HIPAA",
  version: "2013",
  controls: [
    {
      id: "hipaa-164.306-a-1",
      frameworkId: "hipaa",
      ref: "164.306(a)(1)",
      title: "Ensure the confidentiality, integrity, and availability of ePHI",
      description:
        "Covered entities must protect against any reasonably anticipated threats or hazards to the security or integrity of ePHI.",
    },
    {
      id: "hipaa-164.308-a-1",
      frameworkId: "hipaa",
      ref: "164.308(a)(1)",
      title: "Security Management Process",
      description:
        "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
    },
    {
      id: "hipaa-164.308-a-3",
      frameworkId: "hipaa",
      ref: "164.308(a)(3)",
      title: "Workforce Security",
      description:
        "Implement policies and procedures to ensure that all workforce members have appropriate access to ePHI and to prevent unauthorized access.",
    },
    {
      id: "hipaa-164.308-a-4",
      frameworkId: "hipaa",
      ref: "164.308(a)(4)",
      title: "Information Access Management",
      description:
        "Implement policies and procedures for authorizing access to ePHI that are consistent with the Privacy Rule.",
    },
    {
      id: "hipaa-164.308-a-5",
      frameworkId: "hipaa",
      ref: "164.308(a)(5)",
      title: "Security Awareness and Training",
      description:
        "Implement a security awareness and training program for all workforce members including management.",
    },
    {
      id: "hipaa-164.308-a-6",
      frameworkId: "hipaa",
      ref: "164.308(a)(6)",
      title: "Security Incident Procedures",
      description:
        "Implement policies and procedures to address security incidents, including response and reporting.",
    },
    {
      id: "hipaa-164.312-a-1",
      frameworkId: "hipaa",
      ref: "164.312(a)(1)",
      title: "Access Control",
      description:
        "Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.",
    },
    {
      id: "hipaa-164.312-a-2-iv",
      frameworkId: "hipaa",
      ref: "164.312(a)(2)(iv)",
      title: "Encryption and Decryption",
      description: "Implement a mechanism to encrypt and decrypt ePHI.",
    },
    {
      id: "hipaa-164.312-b",
      frameworkId: "hipaa",
      ref: "164.312(b)",
      title: "Audit Controls",
      description:
        "Implement hardware, software, and procedural mechanisms that record and examine activity in information systems that contain or use ePHI.",
    },
    {
      id: "hipaa-164.312-e-1",
      frameworkId: "hipaa",
      ref: "164.312(e)(1)",
      title: "Transmission Security",
      description:
        "Implement technical security measures to guard against unauthorized access to ePHI transmitted over an electronic communications network.",
    },
  ],
};
