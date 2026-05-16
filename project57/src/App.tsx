import React, { useState } from 'react';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import MealPlanner from './components/MealPlanner';
import ShoppingList from './components/ShoppingList';
import CookingAssistant from './components/CookingAssistant';
import { BookOpen, Calendar, ShoppingCart, ChefHat, Sparkles } from 'lucide-react';
import './index.css';

type Page = 'recipes' | 'planner' | 'shopping' | 'cooking';
type RecipeView = 'list' | 'detail' | 'edit' | 'create';

const generateId = () => Math.random().toString(36).substring(2, 15);

const mockRecipesData = [
  {
    id: generateId(),
    name: '番茄炒蛋',
    description: '经典家常菜，简单易做，营养丰富，酸甜可口的番茄搭配嫩滑的鸡蛋，是最受欢迎的下饭菜之一。',
    prepTime: 10,
    cookTime: 8,
    servings: 2,
    ingredients: [
      { id: generateId(), name: '番茄', amount: 300, unit: 'g', category: 'produce' },
      { id: generateId(), name: '鸡蛋', amount: 150, unit: 'g', category: 'dairy' },
      { id: generateId(), name: '盐', amount: 3, unit: 'g', category: 'spice' },
      { id: generateId(), name: '食用油', amount: 20, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '葱花', amount: 10, unit: 'g', category: 'produce' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '番茄洗净切块，鸡蛋打散加少许盐调味', duration: 5 },
      { id: generateId(), order: 2, instruction: '热锅倒油，倒入蛋液炒至凝固盛出备用', duration: 3 },
      { id: generateId(), order: 3, instruction: '锅中留底油，放入番茄翻炒出汁', duration: 3 },
      { id: generateId(), order: 4, instruction: '倒入炒好的鸡蛋，加盐调味，翻炒均匀，撒上葱花即可出锅', duration: 2 },
    ],
    cuisine: 'chinese',
    cookingMethod: 'stir-fry',
    dietType: 'normal',
    difficulty: 'easy',
    tags: ['家常菜', '快手菜', '下饭菜', '新手必学'],
    nutrition: { calories: 320, protein: 18, fat: 24, carbs: 12 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: generateId(),
    name: '红烧肉',
    description: '肥而不腻，入口即化的经典红烧肉，色泽红亮，香气扑鼻，是宴客必备的硬菜。',
    prepTime: 20,
    cookTime: 90,
    servings: 4,
    ingredients: [
      { id: generateId(), name: '五花肉', amount: 600, unit: 'g', category: 'meat' },
      { id: generateId(), name: '生抽', amount: 45, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '老抽', amount: 20, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '冰糖', amount: 40, unit: 'g', category: 'spice' },
      { id: generateId(), name: '姜', amount: 20, unit: 'g', category: 'produce' },
      { id: generateId(), name: '八角', amount: 5, unit: 'g', category: 'spice' },
      { id: generateId(), name: '桂皮', amount: 5, unit: 'g', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '五花肉切成3厘米见方的块，冷水下锅焯水去血沫，捞出沥干', duration: 15 },
      { id: generateId(), order: 2, instruction: '热锅不放油，放入五花肉煸炒出油脂，表面微黄', duration: 10 },
      { id: generateId(), order: 3, instruction: '加入冰糖炒出糖色，加入生抽老抽调色', duration: 5 },
      { id: generateId(), order: 4, instruction: '加入开水没过肉，放入姜片、八角、桂皮，大火烧开转小火炖1小时', duration: 60 },
      { id: generateId(), order: 5, instruction: '大火收汁至浓稠，汤汁包裹在肉上即可出锅', duration: 10 },
    ],
    cuisine: 'chinese',
    cookingMethod: 'slow-cook',
    dietType: 'normal',
    difficulty: 'medium',
    tags: ['硬菜', '下饭菜', '宴客菜', '经典'],
    nutrition: { calories: 580, protein: 15, fat: 52, carbs: 15 },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: generateId(),
    name: '日式照烧鸡腿',
    description: '甜咸适口的日式照烧鸡腿饭，外焦里嫩，酱汁浓郁，配上米饭简直绝配！',
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    ingredients: [
      { id: generateId(), name: '鸡腿', amount: 400, unit: 'g', category: 'meat' },
      { id: generateId(), name: '酱油', amount: 60, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '味醂', amount: 40, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '清酒', amount: 20, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '白糖', amount: 20, unit: 'g', category: 'spice' },
      { id: generateId(), name: '白芝麻', amount: 5, unit: 'g', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '鸡腿去骨，用刀背拍松，用牙签在鸡皮上扎孔帮助入味', duration: 10 },
      { id: generateId(), order: 2, instruction: '混合酱油、味醂、清酒、白糖调成照烧汁', duration: 5 },
      { id: generateId(), order: 3, instruction: '热锅鸡皮朝下煎至金黄翻面，煎至两面金黄', duration: 10 },
      { id: generateId(), order: 4, instruction: '倒入照烧汁，中小火煮至汤汁浓稠，期间翻面让鸡肉均匀裹上酱汁', duration: 10 },
      { id: generateId(), order: 5, instruction: '切片装盘，淋上剩余酱汁，撒上白芝麻', duration: 5 },
    ],
    cuisine: 'japanese',
    cookingMethod: 'grill',
    dietType: 'normal',
    difficulty: 'medium',
    tags: ['日式', '便当', '快手菜', '下饭'],
    nutrition: { calories: 450, protein: 32, fat: 22, carbs: 28 },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: generateId(),
    name: '意大利肉酱面',
    description: '经典番茄肉酱意大利面，浓郁的肉酱配上劲道的意面，西式主食的完美选择。',
    prepTime: 15,
    cookTime: 40,
    servings: 2,
    ingredients: [
      { id: generateId(), name: '意面', amount: 200, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '牛肉末', amount: 250, unit: 'g', category: 'meat' },
      { id: generateId(), name: '番茄罐头', amount: 400, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '洋葱', amount: 150, unit: 'g', category: 'produce' },
      { id: generateId(), name: '大蒜', amount: 15, unit: 'g', category: 'produce' },
      { id: generateId(), name: '橄榄油', amount: 30, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '黑胡椒', amount: 2, unit: 'g', category: 'spice' },
      { id: generateId(), name: '帕玛森芝士', amount: 20, unit: 'g', category: 'dairy' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '洋葱切丁，大蒜切末', duration: 8 },
      { id: generateId(), order: 2, instruction: '热锅加橄榄油，炒香洋葱和大蒜至透明', duration: 5 },
      { id: generateId(), order: 3, instruction: '加入牛肉末炒散至变色', duration: 8 },
      { id: generateId(), order: 4, instruction: '倒入番茄罐头，加盐和黑胡椒调味，小火煮25分钟', duration: 25 },
      { id: generateId(), order: 5, instruction: '另起锅煮意面至八分熟，捞出拌入肉酱中', duration: 12 },
    ],
    cuisine: 'italian',
    cookingMethod: 'boil',
    dietType: 'normal',
    difficulty: 'easy',
    tags: ['意式', '主食', '快手菜'],
    nutrition: { calories: 620, protein: 35, fat: 28, carbs: 65 },
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: generateId(),
    name: '鸡胸肉蔬菜沙拉',
    description: '清爽健康的蔬菜沙拉，高蛋白低卡，健身减脂必备，营养均衡又美味。',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { id: generateId(), name: '鸡胸肉', amount: 200, unit: 'g', category: 'meat' },
      { id: generateId(), name: '生菜', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '黄瓜', amount: 150, unit: 'g', category: 'produce' },
      { id: generateId(), name: '圣女果', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '牛油果', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '橄榄油', amount: 20, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '柠檬汁', amount: 15, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '蜂蜜', amount: 10, unit: 'g', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '鸡胸肉用盐和黑胡椒腌制10分钟，平底锅煎熟切片', duration: 15 },
      { id: generateId(), order: 2, instruction: '生菜洗净撕成小块，黄瓜切片，圣女果对半切', duration: 5 },
      { id: generateId(), order: 3, instruction: '牛油果去核切片', duration: 3 },
      { id: generateId(), order: 4, instruction: '将所有蔬菜放入大碗中，摆上鸡胸肉片', duration: 2 },
      { id: generateId(), order: 5, instruction: '混合橄榄油、柠檬汁、蜂蜜调成酱汁，淋在沙拉上拌匀即可', duration: 3 },
    ],
    cuisine: 'western',
    cookingMethod: 'raw',
    dietType: 'low-fat',
    difficulty: 'easy',
    tags: ['健康', '低卡', '健身', '减脂'],
    nutrition: { calories: 380, protein: 28, fat: 25, carbs: 18 },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: generateId(),
    name: '清蒸鲈鱼',
    description: '鲜嫩多汁的清蒸鲈鱼，最大程度保留了鱼的鲜美，清淡健康，老少皆宜。',
    prepTime: 20,
    cookTime: 12,
    servings: 3,
    ingredients: [
      { id: generateId(), name: '鲈鱼', amount: 600, unit: 'g', category: 'seafood' },
      { id: generateId(), name: '葱', amount: 30, unit: 'g', category: 'produce' },
      { id: generateId(), name: '姜', amount: 20, unit: 'g', category: 'produce' },
      { id: generateId(), name: '蒸鱼豉油', amount: 30, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '料酒', amount: 20, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '食用油', amount: 25, unit: 'ml', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '鲈鱼处理干净，两面划几刀，用料酒和姜片腌制15分钟', duration: 20 },
      { id: generateId(), order: 2, instruction: '蒸锅水烧开，放入鲈鱼大火蒸8-10分钟', duration: 10 },
      { id: generateId(), order: 3, instruction: '蒸好后倒掉盘中汁水，铺上葱丝', duration: 2 },
      { id: generateId(), order: 4, instruction: '淋上蒸鱼豉油，烧热油浇在葱丝上激发出香味', duration: 3 },
    ],
    cuisine: 'chinese',
    cookingMethod: 'steam',
    dietType: 'low-fat',
    difficulty: 'easy',
    tags: ['海鲜', '清淡', '健康', '快手菜'],
    nutrition: { calories: 220, protein: 35, fat: 12, carbs: 5 },
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: generateId(),
    name: '韩式石锅拌饭',
    description: '料足味美的韩式石锅拌饭，各种蔬菜配上溏心蛋和辣酱，拌匀后每一口都是满足。',
    prepTime: 30,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { id: generateId(), name: '米饭', amount: 400, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '牛肉片', amount: 150, unit: 'g', category: 'meat' },
      { id: generateId(), name: '鸡蛋', amount: 100, unit: 'g', category: 'dairy' },
      { id: generateId(), name: '菠菜', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '胡萝卜', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '黄豆芽', amount: 100, unit: 'g', category: 'produce' },
      { id: generateId(), name: '韩式辣酱', amount: 30, unit: 'g', category: 'spice' },
      { id: generateId(), name: '芝麻油', amount: 10, unit: 'ml', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '各种蔬菜分别焯水后沥干，用盐和芝麻油调味', duration: 15 },
      { id: generateId(), order: 2, instruction: '牛肉片用酱油、蒜末、糖腌制后炒熟', duration: 8 },
      { id: generateId(), order: 3, instruction: '石锅刷芝麻油，放入米饭，上面摆上各种蔬菜和牛肉', duration: 5 },
      { id: generateId(), order: 4, instruction: '中间打入一颗生鸡蛋，小火加热至锅底形成锅巴', duration: 10 },
      { id: generateId(), order: 5, instruction: '加入韩式辣酱，趁热拌匀即可享用', duration: 2 },
    ],
    cuisine: 'korean',
    cookingMethod: 'other',
    dietType: 'normal',
    difficulty: 'medium',
    tags: ['韩式', '主食', '丰盛'],
    nutrition: { calories: 550, protein: 30, fat: 22, carbs: 62 },
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
  },
  {
    id: generateId(),
    name: '泰式冬阴功汤',
    description: '酸辣鲜香的冬阴功汤，泰国经典美食，开胃提神，让人欲罢不能。',
    prepTime: 25,
    cookTime: 20,
    servings: 3,
    ingredients: [
      { id: generateId(), name: '虾', amount: 300, unit: 'g', category: 'seafood' },
      { id: generateId(), name: '蛤蜊', amount: 200, unit: 'g', category: 'seafood' },
      { id: generateId(), name: '椰浆', amount: 200, unit: 'ml', category: 'dairy' },
      { id: generateId(), name: '柠檬草', amount: 10, unit: 'g', category: 'produce' },
      { id: generateId(), name: '青柠', amount: 50, unit: 'g', category: 'produce' },
      { id: generateId(), name: '小米辣', amount: 10, unit: 'g', category: 'produce' },
      { id: generateId(), name: '鱼露', amount: 20, unit: 'ml', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '虾去壳留尾，蛤蜊吐沙洗净', duration: 10 },
      { id: generateId(), order: 2, instruction: '锅中加水，放入柠檬草、小米辣煮开', duration: 5 },
      { id: generateId(), order: 3, instruction: '放入虾和蛤蜊煮至开口', duration: 8 },
      { id: generateId(), order: 4, instruction: '倒入椰浆，加鱼露调味', duration: 5 },
      { id: generateId(), order: 5, instruction: '关火挤入青柠汁，搅拌均匀即可', duration: 2 },
    ],
    cuisine: 'thai',
    cookingMethod: 'boil',
    dietType: 'low-carb',
    difficulty: 'medium',
    tags: ['泰式', '汤品', '酸辣', '开胃'],
    nutrition: { calories: 280, protein: 22, fat: 18, carbs: 12 },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: generateId(),
    name: '豆浆油条早餐',
    description: '经典中式早餐组合，外酥里嫩的油条配上香浓的豆浆，美好的一天从这里开始。',
    prepTime: 60,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { id: generateId(), name: '黄豆', amount: 200, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '面粉', amount: 300, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '酵母', amount: 5, unit: 'g', category: 'spice' },
      { id: generateId(), name: '盐', amount: 5, unit: 'g', category: 'spice' },
      { id: generateId(), name: '小苏打', amount: 3, unit: 'g', category: 'spice' },
      { id: generateId(), name: '食用油', amount: 500, unit: 'ml', category: 'spice' },
      { id: generateId(), name: '白糖', amount: 30, unit: 'g', category: 'spice' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '黄豆提前浸泡6小时以上，打成豆浆过滤后煮熟', duration: 30 },
      { id: generateId(), order: 2, instruction: '面粉加酵母、盐、小苏打、温水和成面团，醒发30分钟', duration: 40 },
      { id: generateId(), order: 3, instruction: '面团擀成薄片，切成条，两条叠在一起，中间用筷子压一下', duration: 10 },
      { id: generateId(), order: 4, instruction: '油温烧至180度，放入油条生坯炸至金黄捞出', duration: 8 },
      { id: generateId(), order: 5, instruction: '豆浆加白糖调味，配上热油条享用', duration: 2 },
    ],
    cuisine: 'chinese',
    cookingMethod: 'fry',
    dietType: 'normal',
    difficulty: 'hard',
    tags: ['早餐', '中式', '经典', '传统'],
    nutrition: { calories: 420, protein: 15, fat: 25, carbs: 38 },
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: generateId(),
    name: '抹茶慕斯蛋糕',
    description: '清新抹茶风味的慕斯蛋糕，入口即化，甜而不腻，下午茶的完美选择。',
    prepTime: 40,
    cookTime: 180,
    servings: 8,
    ingredients: [
      { id: generateId(), name: '淡奶油', amount: 300, unit: 'ml', category: 'dairy' },
      { id: generateId(), name: '奶油奶酪', amount: 200, unit: 'g', category: 'dairy' },
      { id: generateId(), name: '抹茶粉', amount: 15, unit: 'g', category: 'spice' },
      { id: generateId(), name: '吉利丁片', amount: 10, unit: 'g', category: 'pantry' },
      { id: generateId(), name: '细砂糖', amount: 60, unit: 'g', category: 'spice' },
      { id: generateId(), name: '饼干底', amount: 150, unit: 'g', category: 'pantry' },
    ],
    steps: [
      { id: generateId(), order: 1, instruction: '饼干压碎加融化黄油拌匀，铺在模具底部压实冷藏', duration: 20 },
      { id: generateId(), order: 2, instruction: '吉利丁片冷水泡软', duration: 10 },
      { id: generateId(), order: 3, instruction: '奶油奶酪加糖隔水加热搅拌至顺滑', duration: 15 },
      { id: generateId(), order: 4, instruction: '抹茶粉加少许温水调开，拌入奶酪糊', duration: 5 },
      { id: generateId(), order: 5, instruction: '淡奶油打发至6分发，与奶酪糊拌匀', duration: 10 },
      { id: generateId(), order: 6, instruction: '吉利丁隔水融化，拌入慕斯糊，倒入模具', duration: 5 },
      { id: generateId(), order: 7, instruction: '冷藏4小时以上凝固即可享用', duration: 240 },
    ],
    cuisine: 'western',
    cookingMethod: 'other',
    dietType: 'normal',
    difficulty: 'hard',
    tags: ['甜点', '烘焙', '下午茶', '抹茶'],
    nutrition: { calories: 380, protein: 8, fat: 32, carbs: 18 },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('recipes');
  const [recipes, setRecipes] = useState(mockRecipesData);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipeView, setRecipeView] = useState<RecipeView>('list');
  const [shoppingListMeals, setShoppingListMeals] = useState<any[]>([]);
  const [cookingRecipe, setCookingRecipe] = useState<any>(null);

  const handleSelectRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setRecipeView('detail');
  };

  const handleAddRecipe = () => {
    setSelectedRecipe(null);
    setRecipeView('create');
  };

  const handleEditRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setRecipeView('edit');
  };

  const handleSaveRecipe = (recipe: any) => {
    if (recipe.id) {
      setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
      setSelectedRecipe(recipe);
      setRecipeView('detail');
    } else {
      const newRecipe = { ...recipe, id: generateId(), createdAt: new Date() };
      setRecipes(prev => [...prev, newRecipe]);
      setRecipeView('list');
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
      setRecipeView('list');
    }
  };

  const handleStartCooking = (recipe: any) => {
    setCookingRecipe(recipe);
    setCurrentPage('cooking');
  };

  const handleGenerateShoppingList = (meals: any[]) => {
    setShoppingListMeals(meals);
    setCurrentPage('shopping');
  };

  const navItems = [
    { id: 'recipes' as Page, label: '食谱库', icon: BookOpen, badge: recipes.length },
    { id: 'planner' as Page, label: '周餐单', icon: Calendar, badge: null },
    { id: 'shopping' as Page, label: '购物清单', icon: ShoppingCart, badge: null },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'recipes':
        if (recipeView === 'detail' && selectedRecipe) {
          return (
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => setRecipeView('list')}
              onEdit={() => handleEditRecipe(selectedRecipe)}
              onStartCooking={() => handleStartCooking(selectedRecipe)}
            />
          );
        }
        if (recipeView === 'edit' && selectedRecipe) {
          return (
            <RecipeForm
              recipe={selectedRecipe}
              onSave={handleSaveRecipe}
              onCancel={() => setRecipeView('detail')}
            />
          );
        }
        if (recipeView === 'create') {
          return (
            <RecipeForm
              onSave={handleSaveRecipe}
              onCancel={() => setRecipeView('list')}
            />
          );
        }
        return (
          <RecipeList
            recipes={recipes}
            onSelectRecipe={handleSelectRecipe}
            onAddRecipe={handleAddRecipe}
            onEditRecipe={handleEditRecipe}
            onDeleteRecipe={handleDeleteRecipe}
          />
        );

      case 'planner':
        return (
          <MealPlanner
            recipes={recipes}
            onGenerateShoppingList={handleGenerateShoppingList}
          />
        );

      case 'shopping':
        return <ShoppingList meals={shoppingListMeals} />;

      case 'cooking':
        return (
          <CookingAssistant
            recipe={cookingRecipe}
            onBack={() => setCurrentPage('recipes')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">智慧厨房</h1>
                <p className="text-xs text-gray-500">您的私人烹饪助手</p>
              </div>
            </div>

            <nav className="flex gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge !== null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      currentPage === item.id
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {cookingRecipe && (
              <button
                onClick={() => setCurrentPage('cooking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === 'cooking'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Sparkles size={18} />
                <span className="font-medium">烹饪模式</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2024 智慧厨房 - 让烹饪更简单</p>
            <div className="flex items-center gap-4">
              <span>食谱: {recipes.length} 个</span>
              <span>|</span>
              <span>支持拖拽添加、语音朗读、智能推荐</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
