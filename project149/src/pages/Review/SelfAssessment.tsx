import { useState, useMemo } from 'react';
import { Star, ChefHat, Clock, Smile, MessageSquare, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { useServiceStore } from '../../store/serviceStore';
import { services } from '../../data/services';
import { dishes } from '../../data/dishes';

interface SelfAssessmentProps {
  serviceId: string;
  customerId: string;
}

interface DishRating {
  dishId: string;
  dishName: string;
  rating: number;
}

interface ImprovementItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  note?: string;
}

const improvementOptions = [
  { id: 'prep', label: '备餐效率', icon: <Clock className="w-4 h-4" /> },
  { id: 'timing', label: '上菜时机', icon: <ChefHat className="w-4 h-4" /> },
  { id: 'attitude', label: '服务态度', icon: <Smile className="w-4 h-4" /> },
  { id: 'presentation', label: '菜品摆盘', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'temperature', label: '菜品温度', icon: <ChefHat className="w-4 h-4" /> },
  { id: 'communication', label: '沟通交流', icon: <MessageSquare className="w-4 h-4" /> },
];

export function SelfAssessment({ serviceId, customerId }: SelfAssessmentProps) {
  const { addReview, reviews } = useServiceStore();
  const service = services.find((s) => s.id === serviceId);
  const existingReview = reviews.find((r) => r.serviceId === serviceId);

  const [dishRatings, setDishRatings] = useState<DishRating[]>(() => {
    if (service?.dishesRating && service.dishesRating.length > 0) {
      return service.dishesRating.map((dr) => {
        const dish = dishes.find((d) => d.id === dr.dishId);
        return {
          dishId: dr.dishId,
          dishName: dish?.name || dr.dishId,
          rating: dr.rating,
        };
      });
    }
    return (
      service?.menu.map((dish) => ({
        dishId: dish.dishId,
        dishName: dish.dishName,
        rating: 0,
      })) || []
    );
  });

  const [improvements, setImprovements] = useState<ImprovementItem[]>(() => {
    const serviceImprovements = service?.improvements || [];
    return improvementOptions.map((opt) => ({
      ...opt,
      checked: serviceImprovements.some((imp) => imp.includes(opt.label)),
    }));
  });

  const [overallRating, setOverallRating] = useState<number>(
    existingReview?.overallRating || service?.rating || 0
  );
  const [tasteRating, setTasteRating] = useState<number>(
    existingReview?.tasteRating || 0
  );
  const [presentationRating, setPresentationRating] = useState<number>(
    existingReview?.presentationRating || 0
  );
  const [serviceRating, setServiceRating] = useState<number>(
    existingReview?.serviceRating || 0
  );
  const [summary, setSummary] = useState<string>(
    existingReview?.improvements || service?.feedback || ''
  );
  const [saved, setSaved] = useState(false);

  const dishRanking = useMemo(() => {
    return [...dishRatings].sort((a, b) => b.rating - a.rating);
  }, [dishRatings]);

  const handleDishRating = (dishId: string, rating: number) => {
    setDishRatings((prev) =>
      prev.map((dr) => (dr.dishId === dishId ? { ...dr, rating } : dr))
    );
  };

  const toggleImprovement = (id: string) => {
    setImprovements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = () => {
    addReview({
      serviceId,
      customerId,
      overallRating,
      tasteRating,
      presentationRating,
      serviceRating,
      valueRating: 0,
      comment: summary,
      improvements: improvements
        .filter((i) => i.checked)
        .map((i) => i.label)
        .join(', '),
      wouldRecommend: overallRating >= 4,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderStarRating = (
    rating: number,
    onRate: (rating: number) => void,
    size: 'sm' | 'lg' = 'sm'
  ) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`${
                size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              } ${
                star <= rating
                  ? 'text-gold-500 fill-gold-500'
                  : 'text-gray-300 hover:text-gold-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!service) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-gold-500" />
              综合评分
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">整体满意度</span>
              {renderStarRating(overallRating, setOverallRating, 'lg')}
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">口味评分</span>
              {renderStarRating(tasteRating, setTasteRating)}
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">摆盘评分</span>
              {renderStarRating(presentationRating, setPresentationRating)}
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">服务评分</span>
              {renderStarRating(serviceRating, setServiceRating)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              菜品受欢迎度排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dishRanking.map((dish, index) => (
                <div
                  key={dish.dishId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-gold-100 text-gold-700'
                        : index === 1
                        ? 'bg-gray-100 text-gray-600'
                        : index === 2
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-charcoal truncate">
                      {dish.dishName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= dish.rating
                              ? 'text-gold-500 fill-gold-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-500" />
            菜品评分
            <span className="text-sm font-normal text-gray-500 ml-2">
              请为每道菜品打分
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dishRatings.map((dish) => (
              <div
                key={dish.dishId}
                className="p-4 bg-cream/30 rounded-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-charcoal">
                    {dish.dishName}
                  </span>
                  {dish.rating > 0 && (
                    <Badge variant="gold">{dish.rating}分</Badge>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleDishRating(dish.dishId, star)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= dish.rating
                              ? 'text-gold-500 fill-gold-500'
                              : 'text-gray-300 hover:text-gold-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary-500" />
            环节改进记录
            <span className="text-sm font-normal text-gray-500 ml-2">
              选择需要改进的环节
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {improvements.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleImprovement(item.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  item.checked
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white hover:border-primary-300 text-gray-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.checked ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  {item.checked && (
                    <div className="text-xs text-primary-600">已标记改进</div>
                  )}
                </div>
                {item.checked && (
                  <CheckCircle2 className="w-5 h-5 ml-auto text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            经验总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="请记录本次服务的经验总结、改进措施、心得体会等..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            className="gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                保存评估
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
