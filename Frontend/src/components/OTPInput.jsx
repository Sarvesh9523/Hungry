import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newDigits.join('');
    if (code.length === length && !newDigits.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
        if(i < length) newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length >= length) {
      onComplete?.(pasted.slice(0, length));
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3 my-4">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl outline-none transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed bg-black/20 text-white/50 border-white/5' 
              : digit 
                ? 'bg-gradient-to-br from-fuchsia-600/20 to-rose-600/20 border-fuchsia-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-black/40 border-white/10 text-white/70 hover:border-white/30 focus:border-pink-500 focus:bg-black/60 focus:shadow-[0_0_15px_rgba(236,72,153,0.4)] transform focus:-translate-y-1'}
            border-2
          `}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
