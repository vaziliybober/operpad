import React, { useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import cn from 'classnames';
import axios from 'axios';
import {
  Form,
  FormGroup,
  InputGroup,
  FormControl,
  Button,
} from 'react-bootstrap';

import routes from '../routes.js';
import useChannels from '../hooks/useChannels.js';
import useUserName from '../hooks/useUserName.js';

const MessageForm = () => {
  const userName = useUserName();
  const [{ currentChannelId }] = useChannels();

  const formik = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (values) => {
      const message = {
        text: values.message,
        userName,
        channelId: currentChannelId,
      };
      const data = {
        attributes: message,
      };
      try {
        await axios.post(routes.channelMessagesPath(message.channelId), {
          data,
        });
        formik.resetForm();
      } catch (e) {
        formik.setErrors({
          message: e.message,
        });
      }
    },
  });

  const focusRef = useRef();
  useEffect(() => {
    focusRef.current.focus();
  }, [formik.isSubmitting]);

  const cnInput = cn('mr-2', {
    'is-invalid': !!formik.errors.message,
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      <FormGroup>
        <InputGroup>
          <FormControl
            className={cnInput}
            aria-label="message"
            autoComplete="off"
            name="message"
            required
            pattern=".*\S+.*"
            ref={focusRef}
            onChange={formik.handleChange}
            value={formik.values.message}
            disabled={formik.isSubmitting}
          />
          <Button
            aria-label="submit"
            type="submit"
            disabled={formik.isSubmitting}
          >
            Submit
          </Button>
          <FormControl.Feedback className="d-block" type="invalid">
            {formik.errors.message}
          </FormControl.Feedback>
        </InputGroup>
      </FormGroup>
    </Form>
  );
};

export default MessageForm;
