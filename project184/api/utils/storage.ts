import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

const dataFiles = {
  clubInfo: "clubInfo.json",
  cadres: "cadres.json",
  constitutions: "constitutions.json",
  members: "members.json",
  pointRecords: "pointRecords.json",
  memberRecords: "memberRecords.json",
  activities: "activities.json",
  planVersions: "planVersions.json",
  evaluations: "evaluations.json",
  financeRecords: "financeRecords.json",
  financeReports: "financeReports.json",
  budgetItems: "budgetItems.json",
  achievements: "achievements.json",
  honorApplications: "honorApplications.json",
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDataFile<T>(fileName: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeDataFile<T>(fileName: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export { dataFiles, readDataFile, writeDataFile, generateId, DATA_DIR };
