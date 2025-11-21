/**
 * Default validation messages for built-in rules
 */
export const defaultMessages: Record<string, Record<string, string>> = {
  en: {
    "vorm.validation.required": "This field is required.",
    "vorm.validation.email": "Invalid email address.",
    "vorm.validation.integer": "Must be an integer.",
    "vorm.validation.url": "Must be a valid URL.",
    "vorm.validation.url.protocol": "URL must start with http or https.",
    "vorm.validation.alpha": "Only letters allowed.",
    "vorm.validation.minLength": "Must be at least {1} characters.",
    "vorm.validation.maxLength": "Must be at most {1} characters.",
    "vorm.validation.min": "Must be at least {1}.",
    "vorm.validation.max": "Must be at most {1}.",
    "vorm.validation.between": "Must be between {1} and {2}.",
    "vorm.validation.step": "Must be a multiple of {1}.",
    "vorm.validation.matchField": "Must match {1}.",
    "vorm.validation.pattern": "Invalid format.",
  },
  de: {
    "vorm.validation.required": "Dieses Feld ist erforderlich.",
    "vorm.validation.email": "Ungültige E-Mail-Adresse.",
    "vorm.validation.integer": "Muss eine ganze Zahl sein.",
    "vorm.validation.url": "Muss eine gültige URL sein.",
    "vorm.validation.url.protocol": "URL muss mit http oder https beginnen.",
    "vorm.validation.alpha": "Nur Buchstaben erlaubt.",
    "vorm.validation.minLength": "Muss mindestens {1} Zeichen lang sein.",
    "vorm.validation.maxLength": "Darf höchstens {1} Zeichen lang sein.",
    "vorm.validation.min": "Muss mindestens {1} sein.",
    "vorm.validation.max": "Darf höchstens {1} sein.",
    "vorm.validation.between": "Muss zwischen {1} und {2} liegen.",
    "vorm.validation.step": "Muss ein Vielfaches von {1} sein.",
    "vorm.validation.matchField": "Muss mit {1} übereinstimmen.",
    "vorm.validation.pattern": "Ungültiges Format.",
  },
};
