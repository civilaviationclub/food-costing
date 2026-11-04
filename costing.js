(function(root){
 const categories=['Starter','Main Course','Dessert','Beverage','Buffet','Other'];
 const units=['kg','g','L','ml','piece','pack','portion'];
 const blank=()=>({name:'',category:'Main Course',portions:'',target:30,price:'',direct:0,preparedBy:'',ingredients:[line()]});
 const line=()=>({name:'',unit:'kg',price:'',quantity:'',yield:100,notes:''});
 const has=v=>v!==''&&v!==null&&v!==undefined;
 const numeric=v=>has(v)&&Number.isFinite(Number(v));
 const active=l=>String(l.name||'').trim()||has(l.price)||has(l.quantity)||String(l.notes||'').trim();
 function ingredient(l){
  if(!numeric(l.price)||Number(l.price)<=0||!numeric(l.quantity)||Number(l.quantity)<=0||!numeric(l.yield)||Number(l.yield)<=0||Number(l.yield)>100)return null;
  const purchase=Number(l.quantity)/(Number(l.yield)/100);
  return {purchase,cost:Number(l.price)*purchase,loss:purchase-Number(l.quantity)};
 }
 function errors(r,forSave=false){
  const out=[];
  if(forSave&&!String(r.name||'').trim())out.push('Enter the menu item name.');
  if((forSave||has(r.portions))&&(!numeric(r.portions)||!Number.isInteger(Number(r.portions))||Number(r.portions)<1||Number(r.portions)>10000))out.push('Portions must be a whole number from 1 to 10,000.');
  if(!numeric(r.target)||Number(r.target)<1||Number(r.target)>100)out.push('Target food cost must be from 1% to 100%.');
  if((forSave||has(r.price))&&(!numeric(r.price)||Number(r.price)<=0))out.push('Enter a selling price greater than zero.');
  if(!numeric(r.direct)||Number(r.direct)<0)out.push('Other direct cost must be zero or greater.');
  if(!categories.includes(r.category))out.push('Choose a valid menu category.');
  const lines=r.ingredients.filter(active);
  if(forSave&&!lines.length)out.push('Enter at least one ingredient.');
  if(r.ingredients.length>25)out.push('Use no more than 25 ingredient lines per recipe.');
  r.ingredients.forEach((l,i)=>{if(!active(l))return;
   const prefix='Ingredient '+(i+1)+': ';
   if(!String(l.name||'').trim())out.push(prefix+'enter a name.');
   if(!units.includes(l.unit))out.push(prefix+'choose a unit.');
   if(!numeric(l.price)||Number(l.price)<=0)out.push(prefix+'supplier price must be greater than zero.');
   if(!numeric(l.quantity)||Number(l.quantity)<=0)out.push(prefix+'usable quantity must be greater than zero.');
   if(!numeric(l.yield)||Number(l.yield)<1||Number(l.yield)>100)out.push(prefix+'yield must be from 1% to 100%.');
  });return out;
 }
 function calculate(r){
  const lines=r.ingredients.filter(active),values=lines.map(ingredient);
  if(!lines.length||values.some(v=>v===null)||errors(r).length)return null;
  const ingredientCost=values.reduce((s,v)=>s+v.cost,0),batch=ingredientCost+Number(r.direct);
  const portion=numeric(r.portions)&&Number(r.portions)>0?batch/Number(r.portions):null;
  const suggested=portion===null?null:portion/(Number(r.target)/100);
  const foodCost=portion!==null&&numeric(r.price)&&Number(r.price)>0?portion/Number(r.price):null;
  const profit=foodCost===null?null:Number(r.price)-portion;
  return {ingredientCost,batch,portion,suggested,foodCost,profit,status:foodCost===null?'Enter price and portions':foodCost<=Number(r.target)/100?'Within target':'Above target'};
 }
 function nextId(records){return 'MC-'+String(records.reduce((m,r)=>Math.max(m,Number(String(r.id).slice(3))||0),0)+1).padStart(5,'0');}
 const api={categories,units,blank,line,has,active,ingredient,errors,calculate,nextId};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Costing=api;
})(typeof globalThis!=='undefined'?globalThis:this);
