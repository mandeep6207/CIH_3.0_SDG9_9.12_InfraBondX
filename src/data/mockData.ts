import { Milestone } from "@/app/components/MilestoneStepper";

export interface Project {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  fundingTarget: number;
  fundingRaised: number;
  roi: number;
  tenure: number;
  tokenPrice: number;
  riskScore: number;
  issuerId: string;
  issuerName: string;
  issuerVerified: boolean;
  milestones: Milestone[];
  status: "active" | "completed" | "pending";
  image?: string;
}

export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "Mumbai-Pune Expressway Expansion",
    location: "Maharashtra, India",
    category: "Roads & Highways",
    description:
      "Expansion of the existing expressway to 8 lanes with smart toll systems and EV charging infrastructure. Reduces travel time by 30% and supports SDG 9.",
    fundingTarget: 50000000,
    fundingRaised: 38500000,
    roi: 8.5,
    tenure: 7,
    tokenPrice: 100,
    riskScore: 25,
    issuerId: "issuer-001",
    issuerName: "Maharashtra State Road Development Corporation",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "Tender Approved & Contractor Selected",
        status: "completed",
        date: "Jan 15, 2026",
        escrowRelease: 15,
      },
      {
        id: "m2",
        name: "Land Acquisition Completed",
        status: "completed",
        date: "Mar 20, 2026",
        escrowRelease: 20,
      },
      {
        id: "m3",
        name: "25% Construction Completed",
        status: "in-progress",
        date: "Expected: May 30, 2026",
        escrowRelease: 25,
      },
      {
        id: "m4",
        name: "50% Construction & Audit Report",
        status: "pending",
        escrowRelease: 20,
      },
      {
        id: "m5",
        name: "Project Completion & Handover",
        status: "pending",
        escrowRelease: 20,
      },
    ],
  },
  {
    id: "proj-002",
    name: "Bangalore Metro Line 3 Extension",
    location: "Karnataka, India",
    category: "Public Transport",
    description:
      "15 km metro extension connecting tech parks to residential areas. Expected to reduce traffic congestion by 40% and carbon emissions significantly.",
    fundingTarget: 75000000,
    fundingRaised: 52000000,
    roi: 7.2,
    tenure: 10,
    tokenPrice: 100,
    riskScore: 32,
    issuerId: "issuer-002",
    issuerName: "Bangalore Metro Rail Corporation Ltd",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "DPR Approved by Government",
        status: "completed",
        date: "Dec 10, 2025",
        escrowRelease: 10,
      },
      {
        id: "m2",
        name: "Tunnel Boring Initiated",
        status: "completed",
        date: "Jan 25, 2026",
        escrowRelease: 20,
      },
      {
        id: "m3",
        name: "30% Track Laying Completed",
        status: "in-progress",
        date: "Expected: Apr 15, 2026",
        escrowRelease: 30,
      },
      {
        id: "m4",
        name: "Station Construction & Testing",
        status: "pending",
        escrowRelease: 25,
      },
      {
        id: "m5",
        name: "Commissioning & Safety Certification",
        status: "pending",
        escrowRelease: 15,
      },
    ],
  },
  {
    id: "proj-003",
    name: "Gujarat Solar Power Plant 500MW",
    location: "Gujarat, India",
    category: "Renewable Energy",
    description:
      "Large-scale solar power generation facility to provide clean energy to 200,000 households. Supports SDG 7 and SDG 13 climate action.",
    fundingTarget: 30000000,
    fundingRaised: 28900000,
    roi: 9.5,
    tenure: 5,
    tokenPrice: 100,
    riskScore: 18,
    issuerId: "issuer-003",
    issuerName: "Gujarat Energy Development Agency",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "Site Preparation & Grid Connection Approval",
        status: "completed",
        date: "Nov 5, 2025",
        escrowRelease: 20,
      },
      {
        id: "m2",
        name: "Panel Installation 40% Complete",
        status: "completed",
        date: "Jan 10, 2026",
        escrowRelease: 30,
      },
      {
        id: "m3",
        name: "Inverter Setup & Testing",
        status: "in-progress",
        date: "Expected: Feb 28, 2026",
        escrowRelease: 25,
      },
      {
        id: "m4",
        name: "Grid Synchronization Complete",
        status: "pending",
        escrowRelease: 15,
      },
      {
        id: "m5",
        name: "Final Commissioning & Handover",
        status: "pending",
        escrowRelease: 10,
      },
    ],
  },
  {
    id: "proj-004",
    name: "Delhi Smart City Water Management System",
    location: "Delhi, India",
    category: "Smart Cities",
    description:
      "IoT-enabled water distribution network with leak detection, quality monitoring, and automated metering for 500,000 residents.",
    fundingTarget: 20000000,
    fundingRaised: 12500000,
    roi: 6.8,
    tenure: 8,
    tokenPrice: 100,
    riskScore: 42,
    issuerId: "issuer-004",
    issuerName: "Delhi Jal Board",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "Technology Partner Selection",
        status: "completed",
        date: "Dec 20, 2025",
        escrowRelease: 15,
      },
      {
        id: "m2",
        name: "Sensor Installation 20% Complete",
        status: "in-progress",
        date: "Expected: Mar 10, 2026",
        escrowRelease: 25,
      },
      {
        id: "m3",
        name: "Network Infrastructure Setup",
        status: "pending",
        escrowRelease: 30,
      },
      {
        id: "m4",
        name: "System Integration & Testing",
        status: "pending",
        escrowRelease: 20,
      },
      {
        id: "m5",
        name: "Go-Live & Training",
        status: "pending",
        escrowRelease: 10,
      },
    ],
  },
  {
    id: "proj-005",
    name: "Chennai Port Modernization",
    location: "Tamil Nadu, India",
    category: "Ports & Logistics",
    description:
      "Upgrade of cargo handling infrastructure with automated cranes and digital logistics platform. Increases capacity by 60%.",
    fundingTarget: 45000000,
    fundingRaised: 31200000,
    roi: 8.0,
    tenure: 6,
    tokenPrice: 100,
    riskScore: 28,
    issuerId: "issuer-005",
    issuerName: "Chennai Port Trust",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "Environmental Clearance Obtained",
        status: "completed",
        date: "Oct 15, 2025",
        escrowRelease: 10,
      },
      {
        id: "m2",
        name: "Crane Procurement & Installation",
        status: "completed",
        date: "Dec 30, 2025",
        escrowRelease: 35,
      },
      {
        id: "m3",
        name: "Berth Deepening 50% Complete",
        status: "in-progress",
        date: "Expected: Apr 20, 2026",
        escrowRelease: 25,
      },
      {
        id: "m4",
        name: "IT System Integration",
        status: "pending",
        escrowRelease: 20,
      },
      {
        id: "m5",
        name: "Trial Operations & Handover",
        status: "pending",
        escrowRelease: 10,
      },
    ],
  },
  {
    id: "proj-006",
    name: "Hyderabad Outer Ring Road Phase 2",
    location: "Telangana, India",
    category: "Roads & Highways",
    description:
      "120 km outer ring road with 6-lane configuration to ease city congestion and improve connectivity to industrial zones.",
    fundingTarget: 60000000,
    fundingRaised: 18000000,
    roi: 7.5,
    tenure: 9,
    tokenPrice: 100,
    riskScore: 35,
    issuerId: "issuer-006",
    issuerName: "Hyderabad Metropolitan Development Authority",
    issuerVerified: true,
    status: "active",
    milestones: [
      {
        id: "m1",
        name: "Land Acquisition & Survey",
        status: "completed",
        date: "Nov 28, 2025",
        escrowRelease: 20,
      },
      {
        id: "m2",
        name: "Initial Earthwork & Foundation",
        status: "in-progress",
        date: "Expected: Feb 15, 2026",
        escrowRelease: 25,
      },
      {
        id: "m3",
        name: "Road Laying 30% Complete",
        status: "pending",
        escrowRelease: 25,
      },
      {
        id: "m4",
        name: "Bridge & Flyover Construction",
        status: "pending",
        escrowRelease: 20,
      },
      {
        id: "m5",
        name: "Surface Finishing & Inauguration",
        status: "pending",
        escrowRelease: 10,
      },
    ],
  },
];

export interface Transaction {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  type: "buy" | "sell";
  tokens: number;
  price: number;
  status: "completed" | "pending";
  txHash: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: "tx-001",
    timestamp: "2026-01-28 14:32:15",
    projectId: "proj-001",
    projectName: "Mumbai-Pune Expressway Expansion",
    type: "buy",
    tokens: 50,
    price: 100,
    status: "completed",
    txHash: "0x7f9a4b2c8e1d3f6a9b2c5e8d7f1a4b3c",
  },
  {
    id: "tx-002",
    timestamp: "2026-01-25 10:15:42",
    projectId: "proj-002",
    projectName: "Bangalore Metro Line 3 Extension",
    type: "buy",
    tokens: 30,
    price: 100,
    status: "completed",
    txHash: "0x3c5e7a9d2f4b6c8e1a3f5d7b9c2e4a6f",
  },
  {
    id: "tx-003",
    timestamp: "2026-01-20 16:45:30",
    projectId: "proj-003",
    projectName: "Gujarat Solar Power Plant 500MW",
    type: "buy",
    tokens: 20,
    price: 100,
    status: "completed",
    txHash: "0x9b3e5d7f1c4a6b8e2d4f6a8c1e3b5d7f",
  },
];
