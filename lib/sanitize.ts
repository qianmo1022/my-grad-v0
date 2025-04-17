/**
 * XSS防护工具函数
 * 提供输入验证和净化功能，防止跨站脚本攻击
 */

/**
 * 净化HTML字符串，转义特殊字符以防止XSS攻击
 * @param input 需要净化的输入字符串
 * @returns 净化后的安全字符串
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 验证输入是否包含潜在的XSS攻击代码
 * @param input 需要验证的输入字符串
 * @returns 如果包含潜在XSS代码返回true，否则返回false
 */
export function containsXss(input: string): boolean {
  if (!input) return false;
  
  // 检测常见的XSS攻击模式
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /\bdata\s*:\s*(?:text\/html|application\/javascript)/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 验证并净化用户输入
 * @param input 用户输入
 * @returns 净化后的安全字符串，如果输入包含XSS代码则抛出错误
 */
export function validateAndSanitize(input: string): string {
  if (containsXss(input)) {
    throw new Error('输入包含不安全内容');
  }
  
  return sanitizeHtml(input);
}

/**
 * 净化对象中的所有字符串属性
 * @param obj 需要净化的对象
 * @returns 净化后的对象
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeHtml(result[key]) as T[Extract<keyof T, string>];
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  
  return result;
}