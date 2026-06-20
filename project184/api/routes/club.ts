import { Router, Request, Response } from "express";
import { readDataFile, writeDataFile, generateId } from "../utils/storage.js";
import { dataFiles } from "../utils/storage.js";

const router = Router();

router.get("/info", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.clubInfo, null);
  res.json({ success: true, data });
});

router.put("/info", (req: Request, res: Response) => {
  const currentData = readDataFile(dataFiles.clubInfo, {});
  const updatedData = { ...currentData, ...req.body };
  writeDataFile(dataFiles.clubInfo, updatedData);
  res.json({ success: true, data: updatedData, message: "更新成功" });
});

router.get("/cadres", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.cadres, []);
  res.json({ success: true, data });
});

router.post("/cadres", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.cadres, []);
  const newCadre = {
    ...req.body,
    id: generateId("cadre"),
  };
  const updatedData = [newCadre, ...data];
  writeDataFile(dataFiles.cadres, updatedData);
  res.json({ success: true, data: newCadre, message: "添加成功" });
});

router.put("/cadres/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.cadres, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.cadres, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/cadres/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.cadres, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.cadres, updatedData);
  res.json({ success: true, message: "删除成功" });
});

router.get("/constitutions", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.constitutions, []);
  res.json({ success: true, data });
});

router.get("/constitutions/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.constitutions, []);
  const { id } = req.params;
  const item = data.find((i: any) => i.id === id);
  res.json({ success: true, data: item });
});

router.post("/constitutions", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.constitutions, []);
  const newItem = {
    ...req.body,
    id: generateId("const"),
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.constitutions, updatedData);
  res.json({ success: true, data: newItem, message: "添加成功" });
});

export default router;
