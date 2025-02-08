import React, { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';

const MaskedInput = forwardRef((props, ref) => {
  const { mask, ...other } = props;
  return (
    <IMaskInput
      {...other}
      inputRef={ref} // Passa a ref corretamente para o IMaskInput
      mask={mask}
    />
  );
});

export default MaskedInput;