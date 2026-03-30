import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  primary: (msg: string) => console.log(chalk.cyan(msg)),
  bold: (msg: string) => console.log(chalk.bold(msg)),
  header: (msg: string) => {
    console.log('\n' + chalk.cyan.bold('=== ' + msg + ' ===') + '\n');
  }
};

export const formatTable = (data: any[][]) => {
  return table(data, {
    border: {
      topBody: `─`,
      topJoin: `┬`,
      topLeft: `┌`,
      topRight: `┐`,
      bottomBody: `─`,
      bottomJoin: `┴`,
      bottomLeft: `└`,
      bottomRight: `┘`,
      bodyLeft: `│`,
      bodyRight: `│`,
      bodyJoin: `│`,
      joinBody: `─`,
      joinLeft: `├`,
      joinRight: `┤`,
      joinJoin: `┼`
    }
  });
};

export const createSpinner = (text: string) => {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  });
};
