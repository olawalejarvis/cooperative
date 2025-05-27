import { Request, Response } from '../types';

class IndexController {
    public getIndex(req: Request, res: Response): void {
        res.send('Hello, World!');
    }
}

export { IndexController };