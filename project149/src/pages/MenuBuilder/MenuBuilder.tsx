import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Users,
  Calendar,
  ChefHat,
  Plus,
  Minus,
  Trash2,
  GripVertical,
  Sparkles,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useMenuStore, LocalMenuDish } from '../../store/menuStore';
import { useCustomerStore } from '../../store/customerStore';
import { useDishStore } from '../../store/dishStore';
import type { Customer, Dish } from '../../types';
import NutritionAnalysis from './NutritionAnalysis';
import PricingCalculator from './PricingCalculator';

const CATEGORIES = [
  { value: 'appetizer', label: '前菜' },
  { value: 'main', label: '主菜' },
  { value: 'soup', label: '汤品' },
  { value: 'dessert', label: '甜点' },
  { value: 'drink', label: '饮品' },
];

const OCCASION_TYPES = [
  { value: '日常烹饪', label: '日常烹饪' },
  { value: '家庭聚餐', label: '家庭聚餐' },
  { value: '生日派对', label: '生日派对' },
  { value: '商务宴请', label: '商务宴请' },
  { value: '婚礼宴席', label: '婚礼宴席' },
  { value: '节日庆典', label: '节日庆典' },
  { value: '浪漫约会', label: '浪漫约会' },
  { value: '朋友聚会', label: '朋友聚会' },
];

interface SortableMenuItemProps {
  menuDish: LocalMenuDish;
  onUpdatePortion: (dishId: string, delta: number) => void;
  onRemove: (dishId: string) => void;
}

function SortableMenuItem({ menuDish, onUpdatePortion, onRemove }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menuDish.dish!.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const subtotal = Math.round(menuDish.dish!.cost * menuDish.portion * 100) / 100;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-primary-500 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-charcoal truncate">{menuDish.dish!.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="primary" size="sm">
            {menuDish.dish!.cuisine}
          </Badge>
          <span className="text-sm text-gray-500">
            {menuDish.dish!.category === 'appetizer' && '前菜'}
            {menuDish.dish!.category === 'main' && '主菜'}
            {menuDish.dish!.category === 'soup' && '汤品'}
            {menuDish.dish!.category === 'dessert' && '甜点'}
            {menuDish.dish!.category === 'drink' && '饮品'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onUpdatePortion(menuDish.dish!.id, -1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-medium">{menuDish.portion}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onUpdatePortion(menuDish.dish!.id, 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-20 text-right">
          <span className="font-semibold text-primary-600">¥{subtotal.toFixed(2)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-coral-500 hover:text-coral-600 hover:bg-coral-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(menuDish.dish!.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function DishCard({ dish, onAdd, isRecommended }: { dish: Dish; onAdd: () => void; isRecommended: boolean }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-36 bg-gradient-to-br from-primary-50 to-gold-50 overflow-hidden">
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-primary-300" />
          </div>
        )}
        {isRecommended && (
          <div className="absolute top-2 right-2">
            <Badge variant="gold" size="sm" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              推荐
            </Badge>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="primary" size="sm">
            {dish.cuisine}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-charcoal mb-2">{dish.name}</h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {dish.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag === 'high-protein' && '高蛋白'}
              {tag === 'low-fat' && '低脂'}
              {tag === 'high-fiber' && '高纤维'}
              {tag === 'vegetarian' && '素食'}
              {tag === 'gluten-free' && '无麸质'}
              {!['high-protein', 'low-fat', 'high-fiber', 'vegetarian', 'gluten-free'].includes(tag) && tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">成本</span>
            <p className="text-lg font-bold text-primary-600">¥{dish.cost.toFixed(2)}</p>
          </div>
          <Button
            size="sm"
            onClick={onAdd}
            className="group-hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MenuBuilder() {
  const {
    currentMenu,
    createMenu,
    addDishToMenu,
    removeDishFromMenu,
    updateGuestCount,
    calculateNutrition,
    calculatePrice,
    guestCount,
  } = useMenuStore();

  const { customers, selectedCustomer, selectCustomer } = useCustomerStore();
  const { dishes } = useDishStore();

  const [menuName, setMenuName] = useState('');
  const [occasionType, setOccasionType] = useState('日常烹饪');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedCuisine, setSelectedCuisine] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSmartRecommend, setShowSmartRecommend] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const cuisines = useMemo(() => {
    const uniqueCuisines = [...new Set(dishes.map((d) => d.cuisine))];
    return uniqueCuisines.map((c) => ({ value: c, label: c }));
  }, [dishes]);

  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c.id, label: c.name })),
    [customers]
  );

  const filteredDishes = useMemo(() => {
    let result = dishes;

    if (selectedCustomer) {
      const { allergies, dietaryRestrictions } = selectedCustomer;
      const allergyIngredients = allergies.map((a) => a.toLowerCase());
      
      result = result.filter((dish) => {
        const dishIngredients = dish.ingredients.map((i) => i.name.toLowerCase());
        const hasAllergen = allergyIngredients.some((allergen) =>
          dishIngredients.some((ing) => ing.includes(allergen))
        );
        if (hasAllergen) return false;

        if (dietaryRestrictions.some((d) => d === 'vegetarian')) {
          if (!dish.tags.includes('vegetarian')) return false;
        }
        if (dietaryRestrictions.some((d) => d === 'vegan')) {
          if (!dish.tags.includes('vegan')) return false;
        }
        if (dietaryRestrictions.some((d) => d === 'gluten-free')) {
          if (!dish.tags.includes('gluten-free')) return false;
        }

        return true;
      });
    }

    if (selectedCategory) {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (selectedCuisine) {
      result = result.filter((d) => d.cuisine === selectedCuisine);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.tags.some((t: string) => t.toLowerCase().includes(term))
      );
    }

    if (showSmartRecommend && selectedCustomer) {
      const { favoriteCuisines, tastePreferences } = selectedCustomer;

      result = result.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (favoriteCuisines?.includes(a.cuisine)) scoreA += 3;
        if (favoriteCuisines?.includes(b.cuisine)) scoreB += 3;

        const preferredFlavors = Object.entries(tastePreferences)
          .filter(([_, value]) => value >= 4)
          .map(([key]) => key);

        if (preferredFlavors.some((f) => a.tags.includes(f))) scoreA += 2;
        if (preferredFlavors.some((f) => b.tags.includes(f))) scoreB += 2;

        if (a.tags.some((t: string) => preferredFlavors.includes(t))) scoreA += 1;
        if (b.tags.some((t: string) => preferredFlavors.includes(t))) scoreB += 1;

        return scoreB - scoreA;
      });
    }

    return result;
  }, [dishes, selectedCategory, selectedCuisine, searchTerm, showSmartRecommend, selectedCustomer]);

  const isRecommendedDish = (dish: Dish) => {
    if (!showSmartRecommend || !selectedCustomer) return false;
    const { favoriteCuisines, tastePreferences } = selectedCustomer;
    
    const preferredFlavors = Object.entries(tastePreferences)
      .filter(([_, value]) => value >= 4)
      .map(([key]) => key);
    
    return (
      favoriteCuisines?.includes(dish.cuisine) ||
      preferredFlavors.some((f) => dish.tags.includes(f))
    );
  };

  useEffect(() => {
    if (!currentMenu) {
      createMenu({
        name: menuName || '新菜单',
        occasionType,
      });
    }
  }, [currentMenu, createMenu, menuName, occasionType]);

  useEffect(() => {
    if (currentMenu && currentMenu.dishes.length > 0) {
      calculateNutrition();
      calculatePrice();
    }
  }, [currentMenu?.dishes, guestCount, currentMenu?.occasionType, calculateNutrition, calculatePrice]);

  const handleCustomerChange = (customerId: string | number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      selectCustomer(customer);
    }
  };

  const handleAddDish = (dish: Dish) => {
    addDishToMenu(dish);
  };

  const handleUpdatePortion = (dishId: string, delta: number) => {
    if (!currentMenu) return;
    const menuDish = currentMenu.dishes.find((md) => md.dish!.id === dishId);
    if (!menuDish) return;
    
    const newPortion = menuDish.portion + delta;
    if (newPortion < 1) {
      removeDishFromMenu(dishId);
    } else {
      addDishToMenu(menuDish.dish!, delta);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && currentMenu) {
      const oldIndex = currentMenu.dishes.findIndex((d) => d.dish!.id === active.id);
      const newIndex = currentMenu.dishes.findIndex((d) => d.dish!.id === over.id);
      
      const newDishes = arrayMove(currentMenu.dishes, oldIndex, newIndex);
      useMenuStore.setState((state) => ({
        currentMenu: state.currentMenu
          ? { ...state.currentMenu, dishes: newDishes }
          : null,
      }));
    }
  };

  const handleMenuNameChange = (name: string) => {
    setMenuName(name);
    if (currentMenu) {
      useMenuStore.setState((state) => ({
        currentMenu: state.currentMenu ? { ...state.currentMenu, name } : null,
      }));
    }
  };

  const handleOccasionChange = (occasion: string | number) => {
    setOccasionType(occasion as string);
    if (currentMenu) {
      useMenuStore.setState((state) => ({
        currentMenu: state.currentMenu
          ? { ...state.currentMenu, occasionType: occasion as string }
          : null,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-primary-700 mb-2">
            菜单定制
          </h1>
          <p className="text-gray-600">
            为客户定制个性化菜单，智能推荐符合口味偏好和饮食禁忌的菜品
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="选择客户"
                value={selectedCustomer?.id}
                onChange={handleCustomerChange}
                options={customerOptions}
                placeholder="请选择客户"
              />
              <Input
                label="用餐人数"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => updateGuestCount(parseInt(e.target.value) || 1)}
                prefix={<Users className="w-4 h-4" />}
              />
              <Input
                label="菜单名称"
                value={menuName}
                onChange={(e) => handleMenuNameChange(e.target.value)}
                placeholder="请输入菜单名称"
                prefix={<ChefHat className="w-4 h-4" />}
              />
              <Select
                label="场合类型"
                value={occasionType}
                onChange={handleOccasionChange}
                options={OCCASION_TYPES}
                placeholder="请选择场合"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">菜品库</CardTitle>
                  <Button
                    variant={showSmartRecommend ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowSmartRecommend(!showSmartRecommend)}
                    disabled={!selectedCustomer}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    智能推荐
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <Input
                    placeholder="搜索菜品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<Search className="w-4 h-4" />}
                  />
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">分类：</span>
                    </div>
                    <Button
                      variant={!selectedCategory ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(undefined)}
                    >
                      全部
                    </Button>
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={selectedCategory === cat.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.value)}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                  <div className="w-64">
                    <Select
                      placeholder="选择菜系"
                      value={selectedCuisine}
                      onChange={(val) => setSelectedCuisine(val as string | undefined)}
                      options={[{ value: '', label: '全部菜系' }, ...cuisines]}
                    />
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm text-primary-700">
                      <span className="font-medium">已应用客户筛选：</span>
                      已排除 {selectedCustomer.allergies.length} 种过敏食材，
                      符合 {selectedCustomer.dietaryRestrictions.length} 项饮食偏好
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                  {filteredDishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onAdd={() => handleAddDish(dish)}
                      isRecommended={isRecommendedDish(dish)}
                    />
                  ))}
                </div>

                {filteredDishes.length === 0 && (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">没有找到符合条件的菜品</p>
                    <p className="text-sm text-gray-400 mt-1">请尝试调整筛选条件</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">已选菜单</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  拖拽调整上菜顺序，当前共 {currentMenu?.dishes.length || 0} 道菜
                </p>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={currentMenu?.dishes.map((d) => d.dish!.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {currentMenu?.dishes.map((menuDish) => (
                        <SortableMenuItem
                          key={menuDish.dish!.id}
                          menuDish={menuDish}
                          onUpdatePortion={handleUpdatePortion}
                          onRemove={removeDishFromMenu}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {!currentMenu?.dishes.length && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">从左侧添加菜品到菜单</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <NutritionAnalysis />
            <PricingCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}
