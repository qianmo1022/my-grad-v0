"use client"

import { useState, useEffect } from "react"
import { PlusCircle, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from 'uuid'

// 配置选项分类
interface ConfigCategory {
  id?: string
  categoryKey: string
  name: string
  description: string
  options?: ConfigOption[] // 添加options数组用于存储该分类下的所有选项
}

// 配置选项
interface ConfigOption {
  id?: string
  optionKey: string
  name: string
  description: string
  price: number
  thumbnail?: string
  colorCode?: string
  categoryId?: string
  categoryKey?: string // 添加categoryKey，方便直接关联到对应分类
}

interface CarOptionsFormProps {
  carId?: string
  onComplete: () => void
  initialCategories?: ConfigCategory[]
  initialOptions?: ConfigOption[]
}

// 预定义的分类
const defaultCategories: ConfigCategory[] = [
  { categoryKey: "exterior-color", name: "外观颜色", description: "车身外观颜色选项" },
  { categoryKey: "interior-color", name: "内饰颜色", description: "车内内饰颜色选项" },
  { categoryKey: "wheels", name: "轮毂", description: "轮毂样式和尺寸选项" },
  { categoryKey: "packages", name: "选装包", description: "组合配置选装包" }
]

export default function CarOptionsForm({ 
  carId, 
  onComplete, 
  initialCategories = [], 
  initialOptions = [] 
}: CarOptionsFormProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  
  // 分类和选项数据
  const [categories, setCategories] = useState<ConfigCategory[]>(
    initialCategories.length > 0 ? initialCategories : defaultCategories
  )
  const [options, setOptions] = useState<ConfigOption[]>(initialOptions)
  
  // 生成唯一选项标识符
  const generateUniqueOptionKey = (categoryKey: string) => {
    // 使用UUID生成唯一标识符并移除所有连字符，保留前8位
    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 8);
    return `${categoryKey}-${uniqueId}`;
  };

  // 初始化时预处理数据
  useEffect(() => {
    if (initialOptions.length > 0 && initialCategories.length > 0) {
      // 根据初始选项更新分类的options数组
      const updatedCategories = initialCategories.map(category => {
        const categoryOptions = initialOptions.filter(option => {
          if (option.categoryId && category.id) {
            return option.categoryId === category.id;
          }
          // 通过选项key前缀匹配分类key
          const optionPrefix = option.optionKey.split('-')[0];
          return optionPrefix === category.categoryKey;
        });
        
        return {
          ...category,
          options: categoryOptions
        };
      });
      
      setCategories(updatedCategories);
    }
    
    // 检查是否有默认颜色需要添加为选项
    const defaultColor = sessionStorage.getItem('defaultCarColor');
    if (defaultColor && !carId) {
      // 查找外观颜色分类
      const exteriorColorCategory = categories.find(c => c.categoryKey === 'exterior-color');
      if (exteriorColorCategory) {
        // 检查是否已经存在相同颜色的选项
        const existingColorOption = options.find(o => 
          o.categoryKey === 'exterior-color' && 
          (o.name === defaultColor || o.colorCode === defaultColor)
        );
        
        if (!existingColorOption) {
          // 生成唯一的选项标识符
          const uniqueKey = generateUniqueOptionKey('exterior-color');
          
          // 创建新的颜色选项
          const newColorOption: ConfigOption = {
            optionKey: uniqueKey,
            name: defaultColor,
            description: `默认车身颜色 - ${defaultColor}`,
            price: 0, // 默认颜色通常不额外收费
            colorCode: defaultColor.startsWith('#') ? defaultColor : `#${defaultColor}`,
            categoryKey: 'exterior-color',
            // 不设置临时的categoryId，在保存时会基于categoryKey进行正确关联
            // categoryId: uniqueKey
          };
          
          // 添加到选项列表
          const newOptions = [...options, newColorOption];
          syncOptionsState(newOptions);
          
          toast({
            title: "默认颜色已添加",
            description: `已将默认颜色 ${defaultColor} 添加到配置选项中`,
          });
        }
      }
    }
  }, [categories, options, carId]);
  
  // 检查是否存在默认分类，如果不存在则添加
  useEffect(() => {
    if (categories.length === 0) {
      setCategories(defaultCategories);
    } else {
      // 检查是否所有默认分类都存在
      const missingCategories = defaultCategories.filter(defaultCat => 
        !categories.some(cat => cat.categoryKey === defaultCat.categoryKey)
      );
      
      if (missingCategories.length > 0) {
        setCategories(prev => [...prev, ...missingCategories]);
      }
    }
  }, []);

  // 如果有carId且初始数据为空，则获取数据
  useEffect(() => {
    if (carId && (initialCategories.length === 0 || initialOptions.length === 0)) {
      fetchData()
    }
  }, [carId, initialCategories, initialOptions])

  // 获取配置数据
  const fetchData = async () => {
    try {
      // 获取分类
      const categoriesResponse = await fetch(`/api/dealer/config-categories`)
      if (!categoriesResponse.ok) {
        throw new Error("获取配置分类失败")
      }
      const categoriesData = await categoriesResponse.json()
      if (categoriesData.length > 0) {
        setCategories(categoriesData)
      }

      // 获取该车型的选项
      if (carId) {
        const optionsResponse = await fetch(`/api/dealer/cars/${carId}/config-options`)
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json()
          
          // 为每个选项添加categoryKey，确保数据一致性
          const enhancedOptions = optionsData.map((option: ConfigOption) => {
            // 从选项键中提取分类键
            const categoryKeyFromOption = option.optionKey.split('-')[0];
            const matchingCategory = categoriesData.find((c: ConfigCategory) => 
              c.id === option.categoryId || c.categoryKey === categoryKeyFromOption
            );
            
            return {
              ...option,
              categoryKey: matchingCategory ? matchingCategory.categoryKey : categoryKeyFromOption
            };
          });
          
          setOptions(enhancedOptions)
          
          // 同步选项到分类
          const updatedCategories = categoriesData.map((category: ConfigCategory) => {
            const categoryOptions = enhancedOptions.filter((option: ConfigOption) => {
              if (option.categoryId && category.id) {
                return option.categoryId === category.id;
              }
              if (option.categoryKey) {
                return option.categoryKey === category.categoryKey;
              }
              const optionPrefix = option.optionKey.split('-')[0];
              return optionPrefix === category.categoryKey;
            });
            
            return {
              ...category,
              options: categoryOptions
            };
          });
          
          setCategories(updatedCategories);
        }
      }
    } catch (error) {
      console.error("获取配置数据错误:", error)
      toast({
        title: "数据加载失败",
        description: "无法加载配置数据，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 同步选项到全局选项数组和分类的选项数组
  const syncOptionsState = (newOptions: ConfigOption[]) => {
    setOptions(newOptions);

    // 根据newOptions更新categories中的options数组
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        const categoryOptions = newOptions.filter(option => {
          if (option.categoryKey) {
            return option.categoryKey === category.categoryKey;
          }
        });
        return {
          ...category,
          options: categoryOptions
        };
      });
    });
  };

  // 添加新分类
  const addCategory = () => {
    setCategories([...categories, {
      categoryKey: "",
      name: "",
      description: ""
    }])
  }

  // 删除分类
  const removeCategory = (index: number) => {
    // 检查该分类是否有选项
    const categoryToRemove = categories[index]
    const hasOptions = options.some(option => 
      option.categoryId === categoryToRemove.id || 
      (!option.categoryId && option.optionKey.startsWith(categoryToRemove.categoryKey))
    )
    
    if (hasOptions) {
      toast({
        title: "无法删除",
        description: "该分类下有配置选项，请先删除相关选项",
        variant: "destructive",
      })
      return
    }
    
    const newCategories = [...categories]
    newCategories.splice(index, 1)
    setCategories(newCategories)
  }

  // 更新分类
  const updateCategory = (index: number, field: keyof ConfigCategory, value: string) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      
      // 如果更新的是categoryKey，自动格式化
      if (field === 'categoryKey') {
        const formatted = value.toLowerCase().replace(/\s+/g, '-');
        newCategories[index] = { ...newCategories[index], [field]: formatted };
      } else {
        newCategories[index] = { ...newCategories[index], [field]: value };
      }
      
      return newCategories;
    });
  }

  // 添加新选项
  const addOption = (categoryKey?: string) => {
    // 如果提供了categoryKey，直接使用它查找分类
    if (categoryKey) {
      const categoryByKey = categories.find(c => c.categoryKey === categoryKey)
      if (categoryByKey) {
        // 生成一个确保唯一的选项标识符
        const uniqueKey = generateUniqueOptionKey(categoryByKey.categoryKey);
        
        const newOption: ConfigOption = {
          optionKey: uniqueKey,
          name: "",
          description: "",
          price: 0,
          thumbnail: "",
          // 优先使用分类的实际ID，而不是临时生成ID
          categoryId: categoryByKey.id,
          categoryKey: categoryByKey.categoryKey
        }
        
        const newOptions = [...options, newOption];
        syncOptionsState(newOptions);
        return
      }
    }
    
    // 如果没有提供categoryKey，尝试使用selectedCategory
    const categoryByKey = categories.find(c => c.categoryKey === selectedCategory)
    
    if (!categoryByKey && !selectedCategory) {
      toast({
        title: "请先选择分类",
        description: "请先选择一个分类再添加选项",
        variant: "destructive",
      })
      return
    }
    
    if (categoryByKey) {
      // 生成一个确保唯一的选项标识符
      const uniqueKey = generateUniqueOptionKey(categoryByKey.categoryKey);
      
      const newOption: ConfigOption = {
        optionKey: uniqueKey,
        name: "",
        description: "",
        price: 0,
        thumbnail: "",
        // 优先使用分类的实际ID，而不是临时生成ID
        categoryId: categoryByKey.id,
        categoryKey: categoryByKey.categoryKey
      }
      
      const newOptions = [...options, newOption];
      syncOptionsState(newOptions);
    }
  }

  // 删除选项
  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    syncOptionsState(newOptions);
  }

  // 更新选项
  const updateOption = (index: number, field: keyof ConfigOption, value: string | number) => {
    // 使用函数式更新，只更新需要变化的部分，减少不必要的重新渲染
    const newOptions = options.map((option, i) => {
      // 只更新指定索引的选项
      if (i !== index) return option;
      
      // 如果更新的是optionKey字段
      if (field === 'optionKey' && typeof value === 'string') {
        // 保留分类前缀，确保选项仍然属于正确的分类
        const prefix = option.optionKey.split('-')[0];
        const userInput = value.toLowerCase().replace(/\s+/g, '-');
        // 如果用户输入包含分类前缀，则使用用户输入，否则保留前缀
        const formatted = userInput.startsWith(prefix) ? userInput : `${prefix}-${userInput.replace(/^[^-]+-/, '')}`;
        
        // 更新categoryKey以确保一致性
        const category = categories.find(c => c.categoryKey === prefix);
        if (category) {
          return { 
            ...option, 
            [field]: formatted,
            categoryKey: prefix,
            categoryId: category.id
          };
        }
        
        return { ...option, [field]: formatted };
      } else if (field === 'price' && typeof value === 'string') {
        return { ...option, [field]: parseFloat(value) || 0 };
      } else {
        return { ...option, [field]: value };
      }
    });
    
    syncOptionsState(newOptions);
  }

  // 保存配置数据
  const saveConfigData = async () => {
    // 验证输入
    for (const category of categories) {
      if (!category.categoryKey || !category.name) {
        toast({
          title: "验证失败",
          description: "分类标识和名称不能为空",
          variant: "destructive",
        })
        setActiveTab("categories")
        return
      }
    }
    
    // 收集所有选项进行验证
    const allOptions = options.length > 0 ? options : 
      categories.reduce((acc, category) => {
        return category.options ? [...acc, ...category.options] : acc;
      }, [] as ConfigOption[]);
    
    for (const option of allOptions) {
      if (!option.optionKey || !option.name) {
        toast({
          title: "验证失败",
          description: "选项标识和名称不能为空",
          variant: "destructive",
        })
        setActiveTab("options")
        return
      }
    }

    setIsSaving(true)
    try {
      // 如果是新车型（没有carId），我们需要先创建分类，然后存储选项信息在本地
      if (!carId) {
        // 1. 保存分类 - 对于新车型，我们需要确保分类被创建
        
        const categoriesResponse = await fetch(`/api/dealer/config-categories`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categories),
        })

        if (!categoriesResponse.ok) {
          throw new Error("保存配置分类失败")
        }

        const categoriesResult = await categoriesResponse.json()
        
        // 2. 将分类ID与选项关联起来，确保后续创建车型时能正确关联
        // 保存分类和选项数据到sessionStorage，以便在创建车型后使用
        
        // 收集所有选项
        const allOptions = options.length > 0 ? options :
          categories.reduce((acc, category) => {
            return category.options ? [...acc, ...category.options] : acc;
          }, [] as ConfigOption[]);

        // 使用从API返回的分类信息更新选项的categoryId
        const updatedOptions = allOptions.map(option => {
          // 找到选项对应的分类
          const categoryKey = option.categoryKey || option.optionKey.split('-')[0];
          // 从API返回的分类结果中找到对应的分类
          const newCategory = categoriesResult.categories?.find(
            (c: any) => c.categoryKey === categoryKey
          );
          
          if (newCategory) {
            return { 
              ...option, 
              categoryId: newCategory.id, 
              categoryKey: newCategory.categoryKey
            };
          }
          
          // 如果没找到对应的分类，保留原始值
          return option;
        });

        const configData = {
          categories: categoriesResult.categories,
          options: updatedOptions
        };
        // 存储配置信息到sessionStorage
        sessionStorage.setItem('pendingCarConfig', JSON.stringify(configData))

        toast({
          title: "配置已准备好",
          description: "配置信息已保存，将在车型创建后应用",
        })
        
        // 调用完成回调
        onComplete()
        return
      }
      
      // 以下是有carId的情况，直接更新已有车型的配置
      
      const categoriesResponse = await fetch(`/api/dealer/config-categories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categories),
      })

      if (!categoriesResponse.ok) {
        throw new Error("保存配置分类失败")
      }
      
      const categoriesResult = await categoriesResponse.json()

      // 收集所有选项
      const allOptions = options.length > 0 ? options :
        categories.reduce((acc, category) => {
          return category.options ? [...acc, ...category.options] : acc;
        }, [] as ConfigOption[]);

      // 确保选项关联到正确的分类ID
      const updatedOptions = allOptions.map(option => {
        // 查找选项可能对应的分类（通过categoryId, categoryKey或通过选项key前缀匹配分类key）
        const category = categories.find(c => 
          c.id === option.categoryId || 
          c.categoryKey === option.categoryKey ||
          c.categoryKey === option.optionKey.split('-')[0]
        )
        
        if (category) {
          // 查找是否有新的分类ID
          const newCategory = categoriesResult.categories?.find(
            (c: any) => c.categoryKey === category.categoryKey
          )
          
          if (newCategory) {
            return { ...option, categoryId: newCategory.id, categoryKey: newCategory.categoryKey }
          }
        }
        
        // 如果没有找到匹配的分类，但选项有categoryKey，保留原有的categoryKey
        if (option.categoryKey) {
          return option;
        }
        
        // 如果没有categoryKey，尝试从optionKey中提取
        const optionPrefix = option.optionKey.split('-')[0];
        return { ...option, categoryKey: optionPrefix };
      })

      // 保存更新后的选项
      const optionsResponse = await fetch(`/api/dealer/cars/${carId}/config-options`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOptions),
      })

      if (!optionsResponse.ok) {
        throw new Error("保存配置选项失败")
      }

      toast({
        title: "保存成功",
        description: "配置选项已保存",
      })
      
      onComplete()
    } catch (error) {
      console.error("保存配置数据错误:", error)
      toast({
        title: "保存失败",
        description: "保存配置数据时发生错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 获取特定分类的选项 - 处理相同categoryKey的情况
  const getOptionsForCategory = (categoryKey: string) => {
    // 找到所有匹配categoryKey的分类
    const matchingCategories = categories.filter(c => c.categoryKey === categoryKey);
    
    if (matchingCategories.length === 0) {
      return [];
    }
    
    // 收集所有匹配分类的id
    const categoryIds = matchingCategories.map(c => c.id).filter(Boolean) as string[];
    
    // 如果分类有options属性，直接从所有匹配分类中收集选项
    const optionsFromCategories = matchingCategories.reduce((acc, category) => {
      return category.options ? [...acc, ...category.options] : acc;
    }, [] as ConfigOption[]);
    
    if (optionsFromCategories.length > 0) {
      return optionsFromCategories;
    }
    
    // 使用旧的筛选方法作为备选 - 只返回与当前分类匹配的选项
    return options.filter(option => {
      // 通过categoryId直接匹配
      if (option.categoryId && categoryIds.includes(option.categoryId)) {
        return true;
      }
      
      // 通过categoryKey直接匹配
      if (option.categoryKey === categoryKey) {
        return true;
      }
      
      // 通过选项key前缀匹配分类key
      const optionPrefix = option.optionKey.split('-')[0];
      return optionPrefix === categoryKey;
    });
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">配置分类</TabsTrigger>
          <TabsTrigger value="options">配置选项</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">配置分类管理</h3>
              <Button variant="outline" onClick={addCategory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                添加分类
              </Button>
            </div>
            
            {categories.map((category, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`category-key-${index}`}>分类标识</Label>
                        <Input
                          id={`category-key-${index}`}
                          value={category.categoryKey}
                          onChange={(e) => updateCategory(index, "categoryKey", e.target.value)}
                          placeholder="例如: exterior-color"
                          className="mt-1"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          分类的唯一标识符，如"exterior-color"
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCategory(index)}
                        className="shrink-0 self-end mb-6"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor={`category-name-${index}`}>分类名称</Label>
                      <Input
                        id={`category-name-${index}`}
                        value={category.name}
                        onChange={(e) => updateCategory(index, "name", e.target.value)}
                        placeholder="例如: 外观颜色"
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        分类的显示名称，如"外观颜色"
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor={`category-desc-${index}`}>分类描述</Label>
                      <Textarea
                        id={`category-desc-${index}`}
                        value={category.description}
                        onChange={(e) => updateCategory(index, "description", e.target.value)}
                        placeholder="对此分类的描述"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="options">
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">配置选项管理</h3>
              <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 按categoryKey分组，确保每个分类键只显示一次 */}
                    {Array.from(new Set(categories.map(c => c.categoryKey))).map((categoryKey) => {
                      // 找出该categoryKey的第一个分类对象
                      const category = categories.find(c => c.categoryKey === categoryKey);
                      if (!category) return null;
                      
                      return (
                        <SelectItem key={categoryKey} value={categoryKey}>
                          {category.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => addOption()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  添加选项
                </Button>
              </div>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {/* 按categoryKey分组，确保每个分类键只显示一次 */}
              {Array.from(new Set(categories.map(c => c.categoryKey))).map((categoryKey) => {
                // 找出该categoryKey的第一个分类对象
                const category = categories.find(c => c.categoryKey === categoryKey);
                if (!category) return null;
                
                return (
                  <AccordionItem key={categoryKey} value={categoryKey}>
                    <AccordionTrigger>
                      {category.name} ({getOptionsForCategory(categoryKey).length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addOption(categoryKey)}
                          >
                            <PlusCircle className="mr-2 h-3 w-3" />
                            添加到{category.name}
                          </Button>
                        </div>
                        
                        {getOptionsForCategory(categoryKey).length > 0 ? (
                          getOptionsForCategory(categoryKey).map((option, optionIndex) => {
                            const optionIndexInAll = options.findIndex(o => o.optionKey === option.optionKey);
                            return (
                              <Card key={option.optionKey} className="mb-4">
                                <CardContent className="pt-6">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <Label htmlFor={`option-key-${optionIndexInAll}`}>选项标识</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input
                                          id={`option-key-${optionIndexInAll}`}
                                          value={option.optionKey}
                                          disabled={true}
                                          className="bg-muted"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={() => removeOption(optionIndexInAll)}
                                          className="shrink-0"
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        选项的唯一标识符
                                      </p>
                                    </div>
                                    <div>
                                      <Label htmlFor={`option-name-${optionIndexInAll}`}>选项名称</Label>
                                      <Input
                                        id={`option-name-${optionIndexInAll}`}
                                        value={option.name}
                                        onChange={(e) => updateOption(optionIndexInAll, "name", e.target.value)}
                                        placeholder="例如: 热情红"
                                        className="mt-1"
                                      />
                                      <p className="text-sm text-muted-foreground mt-1">
                                        选项的显示名称，如"热情红"
                                      </p>
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label htmlFor={`option-desc-${optionIndexInAll}`}>选项描述</Label>
                                      <Textarea
                                        id={`option-desc-${optionIndexInAll}`}
                                        value={option.description}
                                        onChange={(e) => updateOption(optionIndexInAll, "description", e.target.value)}
                                        placeholder="对此选项的描述"
                                        className="mt-1"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`option-price-${optionIndexInAll}`}>选项价格</Label>
                                      <Input
                                        id={`option-price-${optionIndexInAll}`}
                                        type="number"
                                        value={option.price}
                                        onChange={(e) => updateOption(optionIndexInAll, "price", e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                      />
                                      <p className="text-sm text-muted-foreground mt-1">
                                        选项的额外价格
                                      </p>
                                    </div>
                                    <div>
                                      <Label htmlFor={`option-thumb-${optionIndexInAll}`}>缩略图URL</Label>
                                      <Input
                                        id={`option-thumb-${optionIndexInAll}`}
                                        value={option.thumbnail || ""}
                                        onChange={(e) => updateOption(optionIndexInAll, "thumbnail", e.target.value)}
                                        placeholder="选项图片URL"
                                        className="mt-1"
                                      />
                                    </div>
                                    {category.categoryKey.includes("color") && (
                                      <div>
                                        <Label htmlFor={`option-color-${optionIndexInAll}`}>颜色代码</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Input
                                            id={`option-color-${optionIndexInAll}`}
                                            value={option.colorCode || ""}
                                            onChange={(e) => updateOption(optionIndexInAll, "colorCode", e.target.value)}
                                            placeholder="#RRGGBB"
                                          />
                                          {option.colorCode && (
                                            <div 
                                              className="w-6 h-6 rounded-full border"
                                              style={{ backgroundColor: option.colorCode }}
                                            />
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          颜色的十六进制代码，如"#FF0000"
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        ) : (
                          <p className="text-center text-muted-foreground">暂无选项，点击上方按钮添加</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              )}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={saveConfigData} 
        disabled={isSaving || categories.length === 0}
        className="mt-6"
      >
        {isSaving ? "保存中..." : "保存车型信息"}
      </Button>
    </div>
  )
}