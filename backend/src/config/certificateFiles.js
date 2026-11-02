"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const certificateFolder = path_1.default.resolve(__dirname, "..", "..", "certificados");
exports.default = {
    directory: certificateFolder,
    storage: multer_1.default.diskStorage({
        destination: certificateFolder,
        filename(req, file, cb) {
            // Mantém o nome original para certificados, apenas remove espaços
            const fileName = file.originalname.replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return cb(null, fileName);
        }
    }),
    // Filtro para aceitar apenas arquivos .p12, .key, .pem
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/x-pkcs12',
            'application/pkcs12',
            'application/octet-stream',
            'application/x-pem-file',
            'application/x-x509-ca-cert'
        ];
        const allowedExtensions = ['.p12', '.key', '.pem', '.crt'];
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error('Formato de arquivo não permitido. Use apenas .p12, .key, .pem ou .crt'));
        }
    }
};
