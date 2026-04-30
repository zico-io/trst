import type { ComplianceFramework } from "@trst/shared";

export const iso27001: ComplianceFramework = {
  id: "iso27001",
  name: "ISO 27001",
  version: "2022",
  controls: [
    {
      id: "iso27001-5.1",
      frameworkId: "iso27001",
      ref: "5.1",
      title: "Information Security Policies",
      description:
        "A set of information security policies shall be defined, approved by management, published, and communicated to employees and relevant external parties.",
    },
    {
      id: "iso27001-5.15",
      frameworkId: "iso27001",
      ref: "5.15",
      title: "Access Control",
      description:
        "Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.",
    },
    {
      id: "iso27001-5.16",
      frameworkId: "iso27001",
      ref: "5.16",
      title: "Identity Management",
      description: "The full life cycle of identities shall be managed.",
    },
    {
      id: "iso27001-5.17",
      frameworkId: "iso27001",
      ref: "5.17",
      title: "Authentication Information",
      description:
        "Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.",
    },
    {
      id: "iso27001-5.33",
      frameworkId: "iso27001",
      ref: "5.33",
      title: "Protection of Records",
      description:
        "Records shall be protected from loss, destruction, falsification, unauthorised access, and unauthorised release.",
    },
    {
      id: "iso27001-8.7",
      frameworkId: "iso27001",
      ref: "8.7",
      title: "Protection Against Malware",
      description:
        "Protection against malware shall be implemented and supported by appropriate user awareness.",
    },
    {
      id: "iso27001-8.12",
      frameworkId: "iso27001",
      ref: "8.12",
      title: "Data Leakage Prevention",
      description:
        "Data leakage prevention measures shall be applied to systems, networks, and any other devices that process, store, or transmit sensitive information.",
    },
    {
      id: "iso27001-8.15",
      frameworkId: "iso27001",
      ref: "8.15",
      title: "Logging",
      description:
        "Logs that record activities, exceptions, faults, and other relevant events shall be produced, stored, protected, and analysed.",
    },
    {
      id: "iso27001-8.24",
      frameworkId: "iso27001",
      ref: "8.24",
      title: "Use of Cryptography",
      description:
        "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.",
    },
    {
      id: "iso27001-8.28",
      frameworkId: "iso27001",
      ref: "8.28",
      title: "Secure Coding",
      description: "Secure coding principles shall be applied to software development.",
    },
  ],
};
