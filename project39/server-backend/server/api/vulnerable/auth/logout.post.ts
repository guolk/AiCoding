export default defineEventHandler(async (event) => {
  const token = extractTokenFromEvent(event);
  
  console.log('用户注销，token:', token);
  
  return {
    success: true,
    message: '注销成功',
  };
});
