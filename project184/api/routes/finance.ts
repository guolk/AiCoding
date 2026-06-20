import { Router, Request, Response } from "express";
import { readDataFile, writeDataFile, generateId } from "../utils/storage.js";
import { dataFiles } from "../utils/storage.js";

const router = Router();

router.get("/records", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.financeRecords, []);
  res.json({ success: true, data });
});

router.post("/records", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.financeRecords, []);
  const newItem = {
    ...req.body,
    id: generateId("fin"),
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.financeRecords, updatedData);
  res.json({ success: true, data: newItem, message: "记录已添加" });
});

router.put("/records/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.financeRecords, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.financeRecords, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/records/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.financeRecords, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.financeRecords, updatedData);
  res.json({ success: true, message: "删除成功" });
});

router.get("/summary", (req: Request, res: Response) => {
  const records = readDataFile(dataFiles.financeRecords, []);
  const totalIncome = records
    .filter((r: any) => r.type === "income")
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalExpense = records
    .filter((r: any) => r.type === "expense")
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  res.json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      balance,
      recordCount: records.length,
    },
  });
});

router.get("/reports", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.financeReports, []);
  res.json({ success: true, data });
});

router.post("/reports/generate", (req: Request, res: Response) => {
  const reports = readDataFile(dataFiles.financeReports, []);
  const records = readDataFile(dataFiles.financeRecords, []);

  const { title, period } = req.body;

  const totalIncome = records
    .filter((r: any) => r.type === "income")
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalExpense = records
    .filter((r: any) => r.type === "expense")
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const newReport = {
    id: generateId("report"),
    title,
    period,
    totalIncome,
    totalExpense,
    balance,
    details: `本期收入合计${totalIncome}元，支出合计${totalExpense}元，结余${balance}元。`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updatedData = [newReport, ...reports];
  writeDataFile(dataFiles.financeReports, updatedData);

  res.json({ success: true, data: newReport, message: "报告已生成" });
});

router.get("/budget", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.budgetItems, []);
  res.json({ success: true, data });
});

router.post("/budget", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.budgetItems, []);
  const newItem = {
    ...req.body,
    id: generateId("budget"),
    actualAmount: req.body.actualAmount || 0,
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.budgetItems, updatedData);
  res.json({ success: true, data: newItem, message: "预算项已添加" });
});

router.put("/budget/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.budgetItems, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.budgetItems, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/budget/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.budgetItems, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.budgetItems, updatedData);
  res.json({ success: true, message: "删除成功" });
});

export default router;
