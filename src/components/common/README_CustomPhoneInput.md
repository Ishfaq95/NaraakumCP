# CustomPhoneInput Component

A custom phone number input field with country selection, validation, and formatting.

## Features

- **Country Selection**: Dropdown with searchable country list
- **Phone Number Formatting**: Automatic formatting based on country pattern
- **Validation**: Length and pattern validation per country
- **RTL Support**: Works with Arabic and other RTL languages
- **Search Functionality**: Search countries by name, Arabic name, or dial code

## Usage

```tsx
import CustomPhoneInput from './components/common/CustomPhoneInput';

const MyComponent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <CustomPhoneInput
      value={phoneNumber}
      onChangeText={setPhoneNumber}
      onCountryChange={setSelectedCountry}
      placeholder="رقم الجوال"
      error=""
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | ✅ | Current phone number value |
| `onChangeText` | `(text: string) => void` | ✅ | Callback when phone number changes |
| `onCountryChange` | `(country: Country) => void` | ❌ | Callback when country is selected |
| `placeholder` | `string` | ❌ | Placeholder text (default: "Enter phone number") |
| `error` | `string` | ❌ | Error message to display |
| `disabled` | `boolean` | ❌ | Whether input is disabled (default: false) |
| `style` | `ViewStyle` | ❌ | Additional styles for the container |

## Country Data Structure

```tsx
interface Country {
  code: string;           // Country code (e.g., 'SA')
  name: string;           // English country name
  nameAr: string;         // Arabic country name
  flag: string;           // Country flag emoji
  dialCode: string;       // International dial code (e.g., '+966')
  pattern: string;        // Phone number pattern (e.g., '## ### ####')
  maxLength: number;      // Maximum digits allowed
}
```

## Supported Countries

- **Saudi Arabia** (+966) - Pattern: `## ### ####` (9 digits)
- **UAE** (+971) - Pattern: `## ### ####` (9 digits)
- **Qatar** (+974) - Pattern: `#### ####` (8 digits)
- **Kuwait** (+965) - Pattern: `#### ####` (8 digits)
- **Bahrain** (+973) - Pattern: `#### ####` (8 digits)
- **Oman** (+968) - Pattern: `#### ####` (8 digits)
- **Jordan** (+962) - Pattern: `# #### ####` (9 digits)
- **Lebanon** (+961) - Pattern: `## ### ###` (8 digits)
- **Egypt** (+20) - Pattern: `## #### ####` (10 digits)
- **Iraq** (+964) - Pattern: `### ### ####` (10 digits)
- **Iran** (+98) - Pattern: `### ### ####` (10 digits)
- **Turkey** (+90) - Pattern: `### ### ####` (10 digits)

## Phone Number Formatting

The component automatically formats phone numbers based on the selected country's pattern:

- **Saudi Arabia**: `50 123 4567` (9 digits)
- **UAE**: `50 123 4567` (9 digits)
- **Qatar**: `1234 5678` (8 digits)
- **Jordan**: `7 1234 5678` (9 digits)

## Validation

- **Length Validation**: Ensures phone number matches country's max length
- **Pattern Validation**: Automatically formats input according to country pattern
- **Real-time Validation**: Updates as user types

## Styling

The component uses your app's global text styles and provides:
- Rounded corners and borders
- Error state styling
- Responsive layout
- RTL support for Arabic text

## Example with Validation

```tsx
const [phoneNumber, setPhoneNumber] = useState('');
const [error, setError] = useState('');

const validatePhoneNumber = () => {
  if (!phoneNumber.trim()) {
    setError('Please enter a phone number');
    return false;
  }
  
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length !== selectedCountry?.maxLength) {
    setError(`Phone number must be ${selectedCountry?.maxLength} digits`);
    return false;
  }
  
  setError('');
  return true;
};

return (
  <CustomPhoneInput
    value={phoneNumber}
    onChangeText={setPhoneNumber}
    error={error}
    onCountryChange={(country) => {
      setSelectedCountry(country);
      setPhoneNumber(''); // Clear when country changes
    }}
  />
);
```

## Demo Component

Use `CustomPhoneInputDemo.tsx` to test the component functionality. 