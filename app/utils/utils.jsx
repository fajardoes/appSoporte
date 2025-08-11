
import Moment from 'moment';

//#region "Utilidades Comunes"
const capitalizeFirstLetter = (string) => {
    // Encuentro todos los correos electrónicos en el texto
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;

    // Divido el texto en fragmentos, separando los correos electrónicos
    const parts = string.split(emailRegex);

    // Encuentro los correos electrónicos en el texto
    const emails = string.match(emailRegex) || [];

    // Aplico la capitalización solo a las partes sin correos
    const capitalizedParts = parts.map(part =>
        part
        .toLowerCase()
        .replace(/(^\w{1}|\.\s*\w{1})/g, (match) => match.toUpperCase())
    );

    // Aplica toLowerCase a los correos electrónicos
    const lowerCaseEmails = emails.map(email => email.toLowerCase());

    // Combino las partes capitalizadas con los correos electrónicos en su lugar original
    let result = '';
    capitalizedParts.forEach((part, index) => {
        result += part + (lowerCaseEmails[index] ? lowerCaseEmails[index] : '');
    });

    return result;
};
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    }
    return text;
};
const capitalizeEachWord = (string) => {
    return string
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); 
};
//#endregion

export {
    capitalizeFirstLetter, Moment, removeAccents, truncateText, capitalizeEachWord
}

export default capitalizeFirstLetter;