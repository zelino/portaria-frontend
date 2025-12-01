/**
 * Utilitários para máscaras de input
 */

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Remove máscara de CPF, retornando apenas números
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Aplica máscara de placa brasileira (ABC-1234 ou ABC1D23)
 */
export function maskPlate(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Formato antigo: ABC-1234 (7 caracteres)
  if (upper.length <= 3) {
    return upper;
  }
  if (upper.length <= 7) {
    return `${upper.slice(0, 3)}-${upper.slice(3)}`;
  }

  // Formato novo: ABC1D23 (7 caracteres, sem hífen)
  return upper.slice(0, 7);
}

/**
 * Remove máscara de placa
 */
export function unmaskPlate(value: string): string {
  return value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/**
 * Valida CPF básico (formato e dígitos verificadores)
 */
export function validateCPF(cpf: string): boolean {
  const numbers = unmaskCPF(cpf);

  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false; // Todos os dígitos são iguais

  let sum = 0;
  let remainder;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;

  return true;
}

/**
 * Valida placa brasileira (antiga ou nova)
 */
export function validatePlate(plate: string): boolean {
  const unmasked = unmaskPlate(plate);

  // Formato antigo: ABC-1234 (3 letras + 4 números)
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/;

  // Formato novo: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
  const newFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

  return oldFormat.test(unmasked) || newFormat.test(unmasked);
}
