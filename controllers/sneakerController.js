const Sneaker = require('../models/sneakerModel');
const { catchAsync } = require('../utils/catchSync');

exports.getAllSneaker = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['sort', 'limit', 'page', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // console.log(queryObj, req.query);

  const sneakers = await Sneaker.find(queryObj);
  res.status(200).json({
    status: 'success',
    length: sneakers.length,
    data: sneakers
  });
});

exports.getLaptopStats = async (req, res) => {
  try {
    const stats = await Sneaker.aggregate([
      {
        $match: { price: { $gte: 15000 } }
      },
      {
        $group: {
          _id: '$type',
          num: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMonthlyPlans = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Sneaker.aggregate([
      {
        $unwind: '$image'
      },
      {
        $match: {
          importedDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$importedDate'
          },
          numSneaker: { $sum: 1 },
          sneakers: { $push: '$image' }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numSneaker: -1
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
