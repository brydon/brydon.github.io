export const PLACES = [
  {id:'home',short:'Welcome',category:'The coffee notebook',title:'Hey, I’m Brydon.',page:'home'},
  {id:'research',short:'Research',category:'Research notebook',title:'Ideas worth exploring.',page:'research'},
  {id:'code',short:'Code',category:'At the workbench',title:'Under the hood.',page:'code'},
  {id:'teaching',short:'Teaching',category:'Teaching notes',title:'Pass it on.',page:'teaching'},
  {id:'blog',short:'Writing',category:'Field notes',title:'Notes from the road.',page:'blog'},
  {id:'about',short:'About',category:'Beyond the work',title:'A few other things.',page:'about'},
  {id:'contact',short:'Contact',category:'The mailbox',title:'Say hello.',page:'contact'},
];
export const byId=id=>PLACES.find(p=>p.id===id);
export const NAV=[['research','Research'],['code','Code'],['teaching','Teaching'],['blog','Writing'],['about','About'],['contact','Contact']];
