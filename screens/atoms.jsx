import { jwtDecode } from 'jwt-decode';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';


function separateName(name) {
    let output = name[0];
    for (let i = 1; i < name.length; i++) {
      if (name[i].match(/[a-zA-Z]/) && name[i] === name[i].toUpperCase()) {
        output += ' ' + name[i];
      } else {
        output += name[i];
      }
    }
    return output;
}



const sessionIDAtom = atom({
    key: 'sessionIDAtom',
    default: '',
})

const userIDAtom = atom({
    key: 'userIDAtom',
    default: '',
})


const LastTSAtom = atom({
    key: 'LastTSAtom',
    default: Date.now(),
})

const motherServerAtom = atom({
    key: 'motherServerAtom',
    default: "",

})


const tokenAtom = atom({
    key: 'tokenAtom',
    default: "",
})

const decodedTokenSelector = selector({
    key: 'decodedTokenSelector',
    get: ({ get }) => {
        const token = get(tokenAtom);
        try {
            return jwtDecode(token);
        } catch (error) {
            return {};
        }
    },
});

const ImageDBURLAtom = atom({
    key: 'ImageDB',
    default: "",
})

const nameSelector = selector({
    key: 'nameSelector',
    get: ({ get }) => {
        const decodedToken = get(decodedTokenSelector);
        try {
            return separateName(decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || '')
        } catch (error) {
            return '';
        }
    },
});

const emailAddressSelector = selector({
    key: 'emailAddressSelector',
    get: ({ get }) => {
        const decodedToken = get(decodedTokenSelector);
        try {
            return decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || '';
        } catch (error) {
            console.error('Error decoding token:', error);
            return '';
        }
    },
});

const avatarUrlSelector = selector({
    key: 'avatarUrlSelector',

    get: ({ get }) => {
        const decodedToken = get(decodedTokenSelector);
        try {
            return decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri"] || '';
        } catch (error) {
            console.error('Error decoding token:', error);
            return 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=';
        }
    },
});


module.exports = {ImageDBURLAtom ,decodedTokenSelector,sessionIDAtom, avatarUrlSelector , emailAddressSelector , nameSelector ,LastTSAtom, userIDAtom, sessionIDAtom, motherServerAtom, tokenAtom, nameSelector, emailAddressSelector, avatarUrlSelector };
