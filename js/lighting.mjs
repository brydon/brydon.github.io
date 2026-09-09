// Date uses the visitor's local timezone, not the server's timezone.
export const isEvening=(hour=new Date().getHours())=>hour<7||hour>=19;
