import type { ComplianceFramework } from "@trst/shared";

export const soc2: ComplianceFramework = {
  id: "soc2",
  name: "SOC 2",
  version: "2017",
  controls: [
    {
      id: "soc2-cc1.1",
      frameworkId: "soc2",
      ref: "CC1.1",
      title: "COSO Principle 1: Commitment to Integrity and Ethical Values",
      description: "The entity demonstrates a commitment to integrity and ethical values.",
    },
    {
      id: "soc2-cc2.2",
      frameworkId: "soc2",
      ref: "CC2.2",
      title: "Internal Communication of Control Information",
      description:
        "The entity internally communicates information, including objectives and responsibilities for internal control.",
    },
    {
      id: "soc2-cc6.1",
      frameworkId: "soc2",
      ref: "CC6.1",
      title: "Logical and Physical Access Controls",
      description:
        "The entity implements logical access security software, infrastructure, and architectures over protected information assets.",
    },
    {
      id: "soc2-cc6.2",
      frameworkId: "soc2",
      ref: "CC6.2",
      title: "Access Provisioning and Removal",
      description:
        "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.",
    },
    {
      id: "soc2-cc6.3",
      frameworkId: "soc2",
      ref: "CC6.3",
      title: "Role-Based Access Control",
      description:
        "The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles.",
    },
    {
      id: "soc2-cc6.7",
      frameworkId: "soc2",
      ref: "CC6.7",
      title: "Encryption of Data in Transit",
      description:
        "The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.",
    },
    {
      id: "soc2-cc7.2",
      frameworkId: "soc2",
      ref: "CC7.2",
      title: "Monitoring of System Components",
      description:
        "The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.",
    },
    {
      id: "soc2-cc8.1",
      frameworkId: "soc2",
      ref: "CC8.1",
      title: "Change Management",
      description:
        "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.",
    },
    {
      id: "soc2-cc9.1",
      frameworkId: "soc2",
      ref: "CC9.1",
      title: "Risk Mitigation",
      description:
        "The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.",
    },
    {
      id: "soc2-a1.2",
      frameworkId: "soc2",
      ref: "A1.2",
      title: "Availability: Environmental Protections",
      description:
        "The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data back-up processes, and recovery infrastructure.",
    },
  ],
};
