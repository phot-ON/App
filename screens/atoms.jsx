import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';




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


module.exports = { LastTSAtom , userIDAtom , sessionIDAtom }