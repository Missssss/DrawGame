import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const reactSwal = withReactContent(Swal);

function swAlert (text){
    reactSwal.fire(text)
}

export default {
    swAlert,
}