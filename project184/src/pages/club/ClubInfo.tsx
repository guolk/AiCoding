import { useState, memo } from "react";
import {
  Building2,
  Calendar,
  Target,
  User,
  Wallet,
  Edit3,
  Save,
  X,
  Info,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils";

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing: boolean;
  editName?: string;
  editType?: string;
  multiline?: boolean;
  editValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InfoItem = memo(function InfoItem({
  icon: Icon,
  label,
  value,
  isEditing,
  editName,
  editType = "text",
  multiline = false,
  editValue = "",
  onChange,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {isEditing && editName ? (
          multiline ? (
            <textarea
              name={editName}
              value={editValue}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          ) : (
            <input
              type={editType}
              name={editName}
              value={editValue}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          )
        ) : (
          <p className="text-gray-900 dark:text-white font-medium">{value}</p>
        )}
      </div>
    </div>
  );
});

export default function ClubInfo() {
  const { clubInfo, updateClubInfo } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: clubInfo.name,
    foundedDate: clubInfo.foundedDate,
    purpose: clubInfo.purpose,
    advisor: clubInfo.advisor,
    feePolicy: clubInfo.feePolicy,
    description: clubInfo.description || "",
  });

  const handleEdit = () => {
    setEditForm({
      name: clubInfo.name,
      foundedDate: clubInfo.foundedDate,
      purpose: clubInfo.purpose,
      advisor: clubInfo.advisor,
      feePolicy: clubInfo.feePolicy,
      description: clubInfo.description || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateClubInfo(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            社团基本信息
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            查看和管理社团的基本资料
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2">
            <Edit3 className="w-4 h-4" />
            编辑信息
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              社团概况
            </Card.Title>
          </Card.Header>
          <Card.Body className="space-y-6">
            <InfoItem
              icon={Building2}
              label="社团名称"
              value={clubInfo.name}
              isEditing={isEditing}
              editName="name"
              editValue={editForm.name}
              onChange={handleInputChange}
            />

            <InfoItem
              icon={Calendar}
              label="成立时间"
              value={formatDate(clubInfo.foundedDate)}
              isEditing={isEditing}
              editName="foundedDate"
              editType="date"
              editValue={editForm.foundedDate}
              onChange={handleInputChange}
            />

            <InfoItem
              icon={Target}
              label="社团宗旨"
              value={clubInfo.purpose}
              isEditing={isEditing}
              editName="purpose"
              multiline
              editValue={editForm.purpose}
              onChange={handleInputChange}
            />

            <InfoItem
              icon={User}
              label="指导老师"
              value={clubInfo.advisor}
              isEditing={isEditing}
              editName="advisor"
              editValue={editForm.advisor}
              onChange={handleInputChange}
            />

            <InfoItem
              icon={Wallet}
              label="会费制度"
              value={clubInfo.feePolicy}
              isEditing={isEditing}
              editName="feePolicy"
              multiline
              editValue={editForm.feePolicy}
              onChange={handleInputChange}
            />
          </Card.Body>
        </Card>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>社团简介</Card.Title>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="请输入社团简介"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {clubInfo.description || "暂无简介"}
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>社团统计</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  成立年限
                </span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {new Date().getFullYear() -
                    new Date(clubInfo.foundedDate).getFullYear()}
                  年
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
