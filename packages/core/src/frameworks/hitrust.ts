import type { ComplianceFramework } from "@trst/shared";

export const hitrust: ComplianceFramework = {
  id: "hitrust",
  name: "HITRUST CSF",
  version: "11.2",
  controls: [
    {
      id: "hitrust-01.a",
      frameworkId: "hitrust",
      ref: "01.a",
      title: "Access Control Policy",
      description:
        "An access control policy that establishes a framework for access control and is supported by documented procedures shall be established, documented, and reviewed.",
    },
    {
      id: "hitrust-01.d",
      frameworkId: "hitrust",
      ref: "01.d",
      title: "User Password Management",
      description:
        "The allocation of passwords shall be controlled through a formal management process and passwords shall meet defined complexity and length requirements.",
    },
    {
      id: "hitrust-06.d",
      frameworkId: "hitrust",
      ref: "06.d",
      title: "Data Protection and Privacy",
      description:
        "Privacy and protection of personally identifiable information shall be ensured as required by relevant legislation, regulations, and contractual clauses.",
    },
    {
      id: "hitrust-07.a",
      frameworkId: "hitrust",
      ref: "07.a",
      title: "Inventory of Assets",
      description:
        "All assets shall be clearly identified and an inventory of all important assets drawn up and maintained.",
    },
    {
      id: "hitrust-09.aa",
      frameworkId: "hitrust",
      ref: "09.aa",
      title: "Audit Logging",
      description:
        "Audit logs recording user activities, exceptions, faults, and information security events shall be produced, kept, and regularly reviewed.",
    },
    {
      id: "hitrust-09.ab",
      frameworkId: "hitrust",
      ref: "09.ab",
      title: "Monitoring System Use",
      description:
        "Procedures for monitoring use of information processing facilities shall be established and the results of the monitoring activities reviewed regularly.",
    },
    {
      id: "hitrust-10.f",
      frameworkId: "hitrust",
      ref: "10.f",
      title: "Encryption",
      description:
        "Encryption shall be used to protect the confidentiality of sensitive or critical information stored on mobile computing devices or transmitted over public networks.",
    },
    {
      id: "hitrust-11.a",
      frameworkId: "hitrust",
      ref: "11.a",
      title: "Reporting Information Security Events",
      description:
        "Information security events shall be reported through appropriate management channels as quickly as possible.",
    },
  ],
};
