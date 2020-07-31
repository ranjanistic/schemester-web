const code = require("../hardcodes/events");
class Invitation{
    constructor(){
        this.type = 'invitation';
        this.target = new Target();
        this.domain = 'http://localhost:3000';
        this.defaultValidity = 7;
    }

    generateLink = async(adminID,instID,target,validdays = this.defaultValidity) =>{

        //todo: attach the moment with link for uniqueness
        let creationTime = getTheMoment(false);
        let expiryTime = getTheMoment(false,validdays);
        let link = `${this.domain}/${target}/external?type=${this.type}&in=${instID}&ad=${adminID}&t=${creationTime}`;
        clog('generated');
        clog(link);
        return {
            link:link,
            create:creationTime,
            exp:expiryTime
        };
    }

    getTemplateLink(adminID,instID,target,createdAt){
        
        return `${this.domain}/${target}/external?type=${this.type}&in=${instID}&ad=${adminID}&t=${createdAt}`;
    }

    checkTimingValidity =(creation,expiration, linktime)=>{
        let current = getTheMoment(false);
        clog("times of link");
        let t = Number(linktime);
        clog(linktime);
        clog(t);
        clog(creation);
        clog(current);
        clog(expiration);
        clog(linktime == String(creation));

        if(creation==0||expiration==0 || linktime!=String(creation) || current<creation){
          clog('first invalid');
          return code.event(code.invite.LINK_INVALID);
        }
        if(current>expiration){
          return code.event(code.invite.LINK_EXPIRED);
        }
        if(current<=expiration&&current>=creation){
          return code.event(code.invite.LINK_ACTIVE);
        }
        return code.event(code.invite.LINK_INVALID);
    }
    isActive(response){
        return response.event == code.invite.LINK_ACTIVE;
    }
    isExpired(response){
        return response.event == code.invite.LINK_EXPIRED;
    }
    isInvalid(response){
        return response.event == code.invite.LINK_INVALID;
    }
}

let getTheMoment = (stringForm = true, dayincrement = 0) => {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let incrementedDate = date + dayincrement;
    if (daysInMonth(month, year) - incrementedDate < 0) {
      incrementedDate = incrementedDate - daysInMonth(month, year);
      if (12 - (month + 1) < 0) {
        month = 13 - month;
        year++;
      } else {
        month++;
      }
    }
    incrementedDate =
      incrementedDate < 10 ? `0${incrementedDate}` : incrementedDate;
    month = month < 10 ? `0${month}` : month;
    let hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
    let min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
    let insts = d.getSeconds();
    let secs = insts < 10 ? `0${insts}` : insts;
    let instm = d.getMilliseconds();
    let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
    if (stringForm) {
      return (
        String(year) +
        String(month) +
        String(incrementedDate) +
        String(hour) +
        String(min) +
        String(secs) +
        String(milli)
      );
    } else {
      return parseInt(
        String(year) +
          String(month) +
          String(incrementedDate) +
          String(hour) +
          String(min) +
          String(secs) +
          String(milli)
      );
    }
};
let daysInMonth = (month, year) => new Date(year, month, 0).getDate();

class Target{
    constructor(){
        this.teacher = 'teacher';
        this.student = 'student';
    }
}
let clog =(msg)=>console.log(msg);
module.exports = new Invitation();