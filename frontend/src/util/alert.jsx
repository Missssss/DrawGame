import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../index.css';

const reactSwal = withReactContent(Swal);

function swAlert (text){
    reactSwal.fire({
        icon: 'info',
        text: text
    })
}

async function enterName(){
    const { value: name } = await Swal.fire({
        title: 'Enter your name',
        input: 'text',
        inputLabel: 'your name',
        // inputValue: "enter your name",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter your name!'
          }
        }
      })
      
      if (name) {
        // Swal.fire(`Your name is ${name}`);
        return name;
      }
}


async function getAvatarList(){
  let avatars = ["happy","haha","cry","kiss","wink","bored","neutro","cold","sob","kookoo","surprise","wow","angry","sleep","cynical"];
  const { value: avatar } = await Swal.fire({
    title: 'Select avatar',
    // input: 'radio',
    html:`<div class="swal2-radio" style="display:flex; justifyContent: center alignItems:center; flex-wrap: wrap; over-flow:auto;">
              <div class="component_border">
                <label onClick="getAvatarValue()"><input type="radio" name="swal2-radio" value="happy">
                  <img  src="${require("../img/happy.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="haha">
                  <img src="${require("../img/haha.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="cry">
                  <img src="${require("../img/cry.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="wink">
                  <img src="${require("../img/wink.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="bored">
                  <img src="${require("../img/bored.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="sleep">
                  <img src="${require("../img/sleep.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="kiss">
                  <img src="${require("../img/kiss.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="neutro">
                  <img src="${require("../img/neutro.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
              <div class="component_border">
                <label><input type="radio" name="avatar-radio" value="cold">
                  <img src="${require("../img/cold.gif")}" style="width:80px; height:80; margin:0px">
                </label>
              </div>
          </div>`,
    preConfirm: () => {
      let avatars = document.getElementsByName("avatar-radio");
      let value;
      for(let avatar of avatars){
        if(avatar.checked){
          value = avatar.value;
          break;
        }
      }
      return value;
    },
  })

  if (avatar) {
    Swal.fire({ html: `You selected ${"avatar"}` })
    return avatar;
  }
}


export { 
    swAlert,
    enterName,
    getAvatarList,
}