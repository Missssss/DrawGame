import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const reactSwal = withReactContent(Swal);

function swAlert (text){
    reactSwal.fire({
        icon: 'info',
        text: text
    })
}

async function  enterName(){
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

export { 
    swAlert,
    enterName,
}