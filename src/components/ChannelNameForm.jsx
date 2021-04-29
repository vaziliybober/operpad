import React, { useRef, useEffect, useMemo } from 'react';
import { Button, Form, FormGroup, FormControl } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';
import cn from 'classnames';

const ChannelNameForm = (props) => {
  const { onSubmit, onCancel, channelNames } = props;

  const inputRef = useRef();
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const schema = useMemo(
    () =>
      yup.object().shape({
        channelName: yup
          .string()
          .min(3, 'Must be 3 to 20 characters')
          .max(20, 'Must be 3 to 20 characters')
          .required('Required')
          .test(
            'unique',
            'Must be unique',
            (value) => !channelNames.includes(value),
          ),
      }),
    [channelNames],
  );

  const formik = useFormik({
    initialValues: {
      channelName: '',
    },
    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async ({ channelName }) => {
      try {
        await onSubmit({ channelName });
      } catch (e) {
        formik.setErrors({
          channelName: e.message,
        });
      }
    },
  });

  const inputClasses = cn('mb-2', {
    'is-invalid': !!formik.errors.channelName,
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      <FormGroup>
        <FormControl
          aria-label="channelName"
          name="channelName"
          autoComplete="off"
          ref={inputRef}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          className={inputClasses}
          value={formik.values.channelName}
        />
        <FormControl.Feedback className="d-block mb-2" type="invalid">
          {formik.errors.channelName}
        </FormControl.Feedback>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={formik.isSubmitting || !!formik.errors.channelName}
          >
            Submit
          </Button>
        </div>
      </FormGroup>
    </Form>
  );
};

export default ChannelNameForm;
