module.exports = {
  root: true,
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['tsconfig.*?.json'],
      },
      extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'prettier',
      ],
      rules: {
        '@angular-eslint/prefer-standalone': 'off',
        '@angular-eslint/prefer-inject': 'off',
      },
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {},
    },
  ],
};
