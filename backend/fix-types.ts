import * as fs from 'fs';
import * as path from 'path';

function fixFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content.replace(/req\.params\.id(?! as)/g, 'req.params.id as string');
  
  // also handle req.query
  newContent = newContent.replace(/req\.query\.status(?! as)/g, 'req.query.status as any');
  
  // For tracking controller specific errors
  newContent = newContent.replace(/orderId: req\.query\.orderId,/g, 'orderId: req.query.orderId as string,');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);
  }
}

const walkDir = (dir: string) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.controller.ts')) {
      fixFile(fullPath);
    }
  }
};

walkDir(path.join(__dirname, 'src/modules'));
