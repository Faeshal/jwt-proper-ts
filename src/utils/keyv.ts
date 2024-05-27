import Keyv from "keyv";

const keyv = new Keyv({ serialize: JSON.stringify, deserialize: JSON.parse });

export default keyv;
