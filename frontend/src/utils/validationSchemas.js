// src/utils/validationSchemas.js
import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  nome: yup.string().required('Nome é obrigatório'),
  celular: yup.string().required('Celular é obrigatório'),
  dataNascimento: yup.string().required('Data de nascimento é obrigatória'),
  password: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
});